from typing import Any, Union, Optional  # Union for 'back' type, Optional for new endpoints

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import easyocr
import tempfile
import shutil
import re
import cv2
import os

import fitz  # PyMuPDF for PDF filling: pip install pymupdf

app = FastAPI()

# ---- CORS ----
# Hard-code allowed frontend origins (4173 + a few common ones)
ALLOWED_ORIGINS = [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://192.168.31.215:4173",  # your Vite Network URL (adjust IP if needed)
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,   # fine now because we’re not using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⭐ simple health endpoint, does NOT affect OCR or PDF logic
@app.get("/")
def root():
    return {"ok": True, "message": "AI DBT OCR + DBT PDF backend is running"}


# ---- EasyOCR Readers ----
reader_aadhaar = easyocr.Reader(['en', 'hi'], gpu=False)
reader_passbook = easyocr.Reader(['en'], gpu=False)


# ================== COMMON HELPERS ==================

def save_upload(file: UploadFile):
    """
    Save uploaded file to a temporary location and return its path.
    (Used for images - keeps original behaviour.)
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    with open(tmp.name, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return tmp.name


def save_upload_pdf(file: UploadFile):
    """
    Separate helper for saving uploaded PDF file (DBT form).
    Does NOT touch existing image behaviour.
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    with open(tmp.name, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return tmp.name


def resize_for_ocr(image, max_dim=1000):
    """
    Downscale large images to speed up OCR, keeping aspect ratio.
    max_dim reduced from 1400 -> 1000 for extra speed without noticeable accuracy loss.
    """
    h, w = image.shape[:2]
    max_current = max(h, w)
    if max_current <= max_dim:
        return image

    scale = max_dim / max_current
    new_w = int(w * scale)
    new_h = int(h * scale)

    new_w = max(new_w, 1)
    new_h = max(new_h, 1)

    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def ocr_with_rotations(img_path: str, reader, angles):
    """
    Generic OCR helper: try given rotation angles, pick best by avg confidence.
    """
    img = cv2.imread(img_path)

    if img is None:
        # Fallback: direct
        results = reader.readtext(img_path, detail=0)
        return "\n".join(results)

    img = resize_for_ocr(img)

    def rotate(image, angle):
        if angle == 0:
            return image
        elif angle == 90:
            return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
        elif angle == 180:
            return cv2.rotate(image, cv2.ROTATE_180)
        elif angle == 270:
            return cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
        else:
            return image

    best_score = -1
    best_text = ""

    for angle in angles:
        rot_img = rotate(img, angle)
        ocr_result = reader.readtext(rot_img, detail=1, paragraph=False)
        if not ocr_result:
            continue

        confidences = [item[2] for item in ocr_result if len(item) >= 3]
        if not confidences:
            continue

        avg_conf = sum(confidences) / len(confidences)

        if avg_conf > best_score:
            best_score = avg_conf
            lines = [item[1] for item in ocr_result]
            best_text = "\n".join(lines)

    if not best_text:
        simple = reader.readtext(img_path, detail=0)
        best_text = "\n".join(simple)

    return best_text


def read_aadhaar_text(img_path: str) -> str:
    """
    Aadhaar OCR.
    Previously rotated [0, 90, 180, 270].
    Now rotate [0, 90, 180] – dropping 270° (rare) to gain speed but keep robustness.
    """
    return ocr_with_rotations(img_path, reader_aadhaar, angles=[0, 90, 180])


def read_passbook_text(img_path: str) -> str:
    """
    Passbook OCR: English only, rotations [0, 180] so upright & upside-down work.
    """
    return ocr_with_rotations(img_path, reader_passbook, angles=[0, 180])


# ================== AADHAAR HELPERS (Hindi + English, no translation) ==================

def _is_probable_name_line(line: str) -> bool:
    """
    Heuristic: check if a line looks like a person's name, not a header/label.
    Works for both Hindi and English.
    """
    if not line:
        return False
    if re.search(r"\d", line):
        return False

    llow = line.lower()
    bad_keywords = (
        "government of india",
        "government",
        "unique identification",
        "aadhaar",
        "uidai",
        "सरकार",
        "भारत सरकार",
        "भारत",
        "आधार",
        "जन्म",
        "date of birth",
        "dob",
        "male",
        "female",
        "पुरुष",
        "महिला",
        "name",   # ignore "Name" label etc.
    )
    if any(k in llow for k in bad_keywords):
        return False

    return True


def extract_fields(text: str):
    """
    Extract Aadhaar-related fields from OCR text.
    Supports English + some Hindi labels.
    Does NOT translate: returns text exactly as OCR gives.
    """
    extracted = {}

    lower = text.lower()
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # ---- Aadhaar Number: line-by-line (avoid mixing with DOB like '2003') ----
    aadhaar_number = None
    aadhaar_candidates = []

    for line in lines:
        # Skip obvious date lines like "21/04/2003"
        if "/" in line and re.search(r"\d{4}", line):
            continue

        # Look for patterns like "4545 6372 4999" or "454563724999" in THIS line only
        matches = re.findall(r"\d{4}\s*\d{4}\s*\d{4}", line)
        for m in matches:
            only_digits = re.sub(r"\D", "", m)  # keep only digits
            if len(only_digits) == 12:
                aadhaar_candidates.append(only_digits)

    if aadhaar_candidates:
        aadhaar_number = aadhaar_candidates[0]

    extracted["aadhaar_number"] = aadhaar_number

    # ---- DOB: handle "जन्म तिथि" + next-line date ----
    dob = None
    dob_idx = None
    date_pattern = r"\d{2}[/-]\d{2}[/-]\d{4}"

    for i, line in enumerate(lines):
        l_lower = line.lower()
        has_label = (
            "dob" in l_lower
            or "date of birth" in l_lower
            or "जन्म" in line
            or "जन्म तिथि" in line
        )

        if has_label:
            # same line
            m = re.search(date_pattern, line)
            if m:
                dob = m.group(0)
                dob_idx = i
                break

            # next line
            if i + 1 < len(lines):
                m2 = re.search(date_pattern, lines[i + 1])
                if m2:
                    dob = m2.group(0)
                    dob_idx = i + 1
                    break

    if not dob:
        m = re.search(r"\b\d{2}[/-]\d{2}[/-]\d{4}\b", text)
        if m:
            dob = m.group(0)
    extracted["dob"] = dob

    # ---- Gender: English & Hindi (no translation, label used only to detect) ----
    gender = None
    if (
        "female" in lower
        or "महिला" in text
        or "स्त्री" in text
    ):
        gender = "FEMALE"
    elif (
        "male" in lower
        or "परुष" in text  # OCR might misread पुरुष
        or "पुरुष" in text
    ):
        gender = "MALE"
    extracted["gender"] = gender

    # ---- Name: lines close to DOB, choose best candidate (Eng pref, then Hindi) ----
    name = None
    candidates = []

    if dob_idx is not None:
        start = max(0, dob_idx - 4)
        for j in range(start, dob_idx):
            line = lines[j]
            if _is_probable_name_line(line):
                candidates.append(line)

    if candidates:
        latin_candidates = [c for c in candidates if re.search(r"[A-Za-z]", c)]
        dev_candidates = [c for c in candidates if re.search(r"[\u0900-\u097F]", c)]

        if latin_candidates:
            name = latin_candidates[0]        # e.g. "Shah Riya Gopaldas"
        elif dev_candidates:
            name = dev_candidates[0]          # e.g. Hindi name
        else:
            name = candidates[0]

    # Fallback: first non-header, non-numeric line in whole text
    if not name:
        header_keywords = (
            "government of india",
            "government",
            "unique identification",
            "aadhaar",
            "uidai",
            "सरकार",
            "भारत सरकार",
            "भारत",
            "आधार",
        )
        for line in lines:
            l = line.lower()
            if any(k in l for k in header_keywords):
                continue
            if re.search(r"\d", line):
                continue
            if not _is_probable_name_line(line):
                continue
            name = line
            break

    extracted["name"] = name

    # ---- Pincode (6 digits) ----
    pin_match = re.search(r"\b\d{6}\b", text)
    pincode = pin_match.group(0) if pin_match else None
    extracted["pincode"] = pincode

    # ---- Address: lines between name and pincode ----
    address = None
    if name:
        try:
            idx_name = next(i for i, l in enumerate(lines) if l == name)
        except StopIteration:
            idx_name = 0
    else:
        idx_name = 0

    idx_pin = None
    if pincode:
        for i, l in enumerate(lines):
            if pincode in l:
                idx_pin = i
                break

    if idx_pin is not None and idx_pin > idx_name + 1:
        addr_lines = lines[idx_name + 1: idx_pin + 1]
        address = ", ".join(addr_lines)

    extracted["address"] = address

    return extracted


# ================== PASSBOOK HELPER (English only, bank-aware) ==================

# Known Indian bank IFSC prefixes (you can add more if needed)
KNOWN_IFSC_PREFIXES = [
    "SBIN",  # State Bank of India
    "PUNB",  # Punjab National Bank
    "HDFC",  # HDFC Bank
    "ICIC",  # ICICI Bank
    "CNRB",  # Canara Bank
    "UTIB",  # Axis Bank
    "IDIB",  # Indian Bank
    "BARB",  # Bank of Baroda
    "BKID",  # Bank of India
    "INDB",  # IndusInd Bank
    "YESB",  # Yes Bank
    "KARB",  # Karnataka Bank
    "KKBK",  # Kotak Mahindra Bank
    "RATN",  # RBL Bank
    "UBIN",  # Union Bank of India
    "MAHB",  # Bank of Maharashtra
    "SCBL",  # Standard Chartered
]


def _normalise_ifsc_candidate(raw: str) -> Optional[str]:
    """
    Take a raw IFSC-looking substring and normalise:
    - Uppercase
    - Strip non-alphanumeric
    - Allow 'O' vs '0' in the 5th character
    - Return a clean 11-character IFSC or None
    """
    if not raw:
        return None

    cand = re.sub(r"[^A-Z0-9]", "", raw.upper())

    # Look for 4 letters + [0 or O] + 6 alnum inside the cleaned string
    m = re.search(r"[A-Z]{4}[0O][A-Z0-9]{6}", cand)
    if not m:
        return None

    code = m.group(0)

    # Normalise O -> 0 in the 5th position
    if code[4] == "O":
        code = code[:4] + "0" + code[5:]

    # Final safety check
    if len(code) != 11:
        return None

    # Only accept if prefix is a known bank (avoids junk like DNNC0XXXXXX)
    prefix = code[:4]
    if prefix not in KNOWN_IFSC_PREFIXES:
        return None

    return code


def extract_ifsc_from_text(text: str) -> Optional[str]:
    """
    Extract IFSC code from OCR text using smarter heuristics:

    1. First search near the word "IFSC"
    2. Then search for known bank prefixes (SBIN, PUNB, HDFC, etc.)
    3. As a last fallback, scan entire text but still require a known prefix

    This avoids random garbage like "DNNC04NCRNO".
    """
    if not text:
        return None

    upper_text = text.upper()

    # ---------- 1) Look near the word "IFSC" ----------
    patterns_near_ifsc = [
        r"IFSC[^A-Z0-9]*([A-Z0-9]{4}.{0,4}[A-Z0-9]{6})",
        r"IFS[ C]*CODE[^A-Z0-9]*([A-Z0-9]{4}.{0,4}[A-Z0-9]{6})",
    ]

    for pat in patterns_near_ifsc:
        for m in re.finditer(pat, upper_text):
            cand = _normalise_ifsc_candidate(m.group(1))
            if cand:
                return cand

    # ---------- 2) Look for known bank prefixes anywhere ----------
    prefix_group = "(" + "|".join(KNOWN_IFSC_PREFIXES) + ")"
    pat_prefix = prefix_group + r"[^A-Z0-9]*[0O][A-Z0-9]{6}"

    for m in re.finditer(pat_prefix, upper_text):
        cand = _normalise_ifsc_candidate(m.group(0))
        if cand:
            return cand

    # ---------- 3) Last fallback ----------
    cleaned = re.sub(r"[^A-Z0-9]", "", upper_text)
    m = re.search(r"[A-Z]{4}[0O][A-Z0-9]{6}", cleaned)
    if m:
        cand = _normalise_ifsc_candidate(m.group(0))
        if cand:
            return cand

    return None


def extract_passbook_fields(text: str):
    """
    Extract bank passbook fields from OCR text using regex & heuristics.

    Bank-aware for:
      - Indian Bank
      - State Bank of India (SBI)
      - Punjab National Bank (PNB)
      - HDFC Bank
      - Axis Bank
      - Canara Bank
      - ICICI Bank

    Generic rules for all other banks.
    """
    extracted = {}
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    lower_lines = [l.lower() for l in lines]

    # ---- IFSC Code (via helper, case-insensitive) ----
    ifsc = extract_ifsc_from_text(text)
    extracted["ifsc"] = ifsc

    # ---- Account Number ----
    account_number = None
    account_line_index = None

    account_keywords = [
        "account",
        "a/c",
        "a c no",
        "a/c no",
        "ac no",
        "account no",
        "acc no",
    ]

    for i, line in enumerate(lower_lines):
        if any(k in line for k in account_keywords):
            for j in range(i, min(i + 5, len(lines))):
                cleaned = re.sub(r"[^0-9]", "", lines[j])
                nums = re.findall(r"[0-9]{9,18}", cleaned)
                if nums:
                    account_number = nums[0]
                    account_line_index = j
                    break
            if account_number:
                break

    if not account_number:
        digits_only = re.sub(r"[^0-9]", " ", text)
        candidates = re.findall(r"[0-9]{9,18}", digits_only)
        if candidates:
            account_number = max(candidates, key=len)

    extracted["accountNumber"] = account_number

    # ---- Name (from "Name:" label) ----
    name = None
    for i, line in enumerate(lower_lines):
        if line.startswith("name"):
            for j in range(i + 1, min(i + 4, len(lines))):
                candidate = lines[j].strip(" :")
                if candidate:
                    name = candidate
                    break
            if name:
                break

    if not name and account_line_index is not None and account_line_index > 0:
        candidate = lines[account_line_index - 1]
        if not re.search(r"[0-9]", candidate):
            name = candidate

    extracted["name"] = name

    # ---- Bank Name (7-bank aware + IFSC-based + generic) ----
    bank_name = None
    bank_line_idx = None

    bank_by_ifsc_prefix = {
        "SBIN": "STATE BANK OF INDIA",
        "PUNB": "PUNJAB NATIONAL BANK",
        "HDFC": "HDFC BANK",
        "UTIB": "AXIS BANK",
        "CNRB": "CANARA BANK",
        "ICIC": "ICICI BANK",
        "IDIB": "INDIAN BANK",
    }

    if ifsc:
        prefix = ifsc[:4]
        if prefix in bank_by_ifsc_prefix:
            bank_name = bank_by_ifsc_prefix[prefix]

    if bank_name is None:
        bank_patterns = {
            "INDIAN BANK": ["indian bank"],
            "STATE BANK OF INDIA": ["state bank of india", "sbi ", " sbi", "s.b.i"],
            "PUNJAB NATIONAL BANK": ["punjab national bank", "pnb"],
            "HDFC BANK": ["hdfc bank", "hdfc"],
            "AXIS BANK": ["axis bank", "axis"],
            "CANARA BANK": ["canara bank"],
            "ICICI BANK": ["icici bank", "icici"],
        }
        for i, line in enumerate(lines):
            l = line.lower()
            for norm_name, tokens in bank_patterns.items():
                if any(t in l for t in tokens):
                    bank_name = norm_name
                    bank_line_idx = i
                    break
            if bank_name:
                break

    if bank_name is None:
        for i, line in enumerate(lines):
            if "bank" in line.lower():
                bank_name = line
                bank_line_idx = i
                break

    extracted["bankName"] = bank_name

    # ---- Branch / Address ----
    branch = None
    branch_address = None
    branch_idx = None

    for i, line in enumerate(lower_lines):
        if "branch" in line:
            raw = lines[i]
            if ":" in raw:
                after = raw.split(":", 1)[1].strip()
                branch = after or raw
            else:
                branch = raw
            branch_idx = i
            break

    if branch_idx is None and bank_name == "STATE BANK OF INDIA":
        for i, line in enumerate(lower_lines):
            if "code:" in line and i > 0:
                branch = lines[i - 1]
                branch_idx = i - 1
                break

    if branch_idx is None and bank_line_idx is not None:
        if bank_line_idx + 1 < len(lines):
            branch = lines[bank_line_idx + 1]
            branch_idx = bank_line_idx + 1

    if branch_idx is not None:
        start_idx = branch_idx + 1
    elif bank_line_idx is not None:
        start_idx = bank_line_idx + 1
    else:
        start_idx = None

    if start_idx is not None:
        addr_parts = []
        for j in range(start_idx, min(start_idx + 8, len(lines))):
            candidate = lines[j]
            low = candidate.lower()

            if re.search(
                r"phone|email|emai|mobile|mob\.|tel\.|ifsc|micr|account|a/c|pan|cif|gst|nominee|date of issue|a/c opening|a/c open",
                low,
            ):
                break

            if "@" in candidate:
                continue

            addr_parts.append(candidate)

        if addr_parts:
            branch_address = ", ".join(addr_parts)

    extracted["branch"] = branch
    extracted["branchAddress"] = branch_address
    extracted["address"] = branch_address

    return extracted


def extract_mobile_from_text(text: str) -> Optional[str]:
    """
    Try to find a 10-digit Indian mobile number in the OCR text.
    """
    m = re.search(r"\b[6-9]\d{9}\b", text)
    return m.group(0) if m else None


# ================== EXISTING OCR ENDPOINTS (UNCHANGED) ==================

@app.post("/ocr/aadhaar")
async def ocr_aadhaar(
    front: UploadFile = File(...),
    back: Union[UploadFile, str, None] = File(None),  # accept file OR empty string OR nothing
):
    """
    Aadhaar OCR:
    - front: required (image)
    - back: optional (image). If invalid/empty/missing, ignored.
    If back is not uploaded, only front OCR is used.
    """
    # ---- Validate FRONT only (mandatory) ----
    if not front.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload image files (JPG/PNG) for front side.",
        )

    # Save & OCR front
    front_path = save_upload(front)
    front_text = read_aadhaar_text(front_path)

    # ---- Handle BACK safely (optional) ----
    back_text = ""

    if isinstance(back, UploadFile):
        if back.filename and back.content_type and back.content_type.startswith("image/"):
            back_path = save_upload(back)
            back_text = read_aadhaar_text(back_path)
        # if wrong type / empty filename -> ignore
    # if back is str ("") or None -> ignore

    # ---- Combine text ----
    if back_text:
        full_text = front_text + "\n" + back_text
    else:
        full_text = front_text  # ONLY front if no valid back

    data = extract_fields(full_text)

    return {"ok": True, "text": full_text, "data": data}


@app.post("/ocr/passbook")
async def ocr_passbook(file: UploadFile = File(...)):
    """
    Passbook OCR: English only, faster, and smarter parsing for account/name/branch.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload image files (JPG/PNG) for passbook.",
        )

    img_path = save_upload(file)
    full_text = read_passbook_text(img_path)
    data = extract_passbook_fields(full_text)

    return {"ok": True, "text": full_text, "data": data}


# ================== NEW: COMBINED OCR FOR FRONTEND (WITH AADHAAR BACK) ==================

@app.post("/ocr-extract-details")
async def ocr_extract_details(
    aadhaar: UploadFile = File(None),
    aadhaar_back: UploadFile = File(None),
    passbook: UploadFile = File(None),
):
    """
    Combined OCR endpoint for frontend.
    - Takes Aadhaar front + optional Aadhaar back + Passbook
    - Uses existing extract_fields / extract_passbook_fields
    - Returns fields shaped like your React FormData so user can VERIFY & EDIT before PDF.
    - Normalises name / bank / branch casing and Aadhaar formatting.
    - Also exposes address from Aadhaar back (via aadhaarAddress).
    """
    if aadhaar is None and passbook is None:
        raise HTTPException(status_code=400, detail="Upload at least Aadhaar or Passbook.")

    aadhaar_front_text = ""
    aadhaar_back_text = ""
    passbook_text = ""
    aadhaar_data: dict = {}
    passbook_data: dict = {}

    # Aadhaar front
    if aadhaar is not None:
        if not aadhaar.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Aadhaar must be an image file.")
        aadhaar_front_path = save_upload(aadhaar)
        aadhaar_front_text = read_aadhaar_text(aadhaar_front_path)

    # Aadhaar back (optional)
    if aadhaar_back is not None:
        if not aadhaar_back.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Aadhaar back must be an image file.")
        aadhaar_back_path = save_upload(aadhaar_back)
        aadhaar_back_text = read_aadhaar_text(aadhaar_back_path)

    # Combine Aadhaar front + back for field extraction
    combined_aadhaar_text = (aadhaar_front_text + "\n" + aadhaar_back_text).strip()
    if combined_aadhaar_text:
        aadhaar_data = extract_fields(combined_aadhaar_text)

    # Passbook
    if passbook is not None:
        if not passbook.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Passbook must be an image file.")
        passbook_path = save_upload(passbook)
        passbook_text = read_passbook_text(passbook_path)
        passbook_data = extract_passbook_fields(passbook_text)

    # ----- Merge into FormData shape with NORMALISATION -----

    # Name: prefer passbook, fallback to Aadhaar
    full_name = (passbook_data.get("name") or aadhaar_data.get("name") or "").strip()
    if full_name:
        # Simple title case for English parts (keeps Hindi chars unchanged)
        parts = full_name.split()
        full_name = " ".join(p.capitalize() for p in parts)

    # Aadhaar number: format 4-4-4 if 12 digits
    aadhaar_number_raw = (aadhaar_data.get("aadhaar_number") or "").strip()
    if len(aadhaar_number_raw) == 12 and aadhaar_number_raw.isdigit():
        aadhaar_number = " ".join(
            [aadhaar_number_raw[i:i + 4] for i in range(0, 12, 4)]
        )
    else:
        aadhaar_number = aadhaar_number_raw

    # Account and IFSC from passbook
    account_number = (passbook_data.get("accountNumber") or "").strip()
    ifsc_code = (passbook_data.get("ifsc") or "").strip().upper()

    # Bank & Branch – uppercase to fix weird OCR casing
    bank_name = (passbook_data.get("bankName") or "").strip()
    if bank_name:
        bank_name = bank_name.upper()

    branch_name = (passbook_data.get("branch") or "").strip()
    if branch_name:
        branch_name = branch_name.upper()

    # Mobile from combined text (all Aadhaar + passbook)
    mobile = extract_mobile_from_text(
        (aadhaar_front_text or "")
        + "\n"
        + (aadhaar_back_text or "")
        + "\n"
        + (passbook_text or "")
    )

    # Address from Aadhaar (usually from back side)
    aadhaar_address = (aadhaar_data.get("address") or "").strip() if aadhaar_data else ""

    extracted_fields = {
        "fullName": full_name,
        "aadhaarNumber": aadhaar_number,
        "accountNumber": account_number,
        "ifscCode": ifsc_code,
        "bankName": bank_name,
        "branchName": branch_name,
        "mobileNumber": mobile or "",
        "email": "",
        "dbtOption": "link_new",  # frontend can change this
        "signature": None,
        "consent": False,
        # ⬇️ this will be shown as "Address (as per Aadhaar)" in VerificationForm
        "aadhaarAddress": aadhaar_address,
    }

    return {
        "ok": True,
        "extractedFields": extracted_fields,
        "raw": {
            "aadhaarFrontText": aadhaar_front_text,
            "aadhaarBackText": aadhaar_back_text,
            "aadhaarData": aadhaar_data,
            "passbookText": passbook_text,
            "passbookData": passbook_data,
        },
    }


# ================== DBT PDF AUTODETECT HELPERS (FOR A4 DBT FORM) ==================

def _get_lines_with_positions(page):
    """
    Group words by line_no to build text lines with coordinates.
    Each item:
    {
      "text": "Account No. _____ in A/c Name ____",
      "x0": ...,
      "y0": ...,
      "x1": ...,
      "y1": ...
    }
    """
    words = page.get_text("words")  # (x0, y0, x1, y1, text, block, line, word)
    lines_map = {}

    for (x0, y0, x1, y1, text, block, line_no, word_no) in words:
        key = (block, line_no)
        if key not in lines_map:
            lines_map[key] = {
                "text": text,
                "x0": x0,
                "y0": y0,
                "x1": x1,
                "y1": y1,
            }
        else:
            lines_map[key]["text"] += " " + text
            lines_map[key]["x1"] = x1
            lines_map[key]["y0"] = min(lines_map[key]["y0"], y0)
            lines_map[key]["y1"] = max(lines_map[key]["y1"], y1)

    return list(lines_map.values())


def _find_after_word_sequence(words, seq_keywords, x_pad=10.0):
    """
    Find coordinates just to the right of a sequence of words.

    seq_keywords: list of lowercase substrings to match in consecutive words.
    Returns (x, y) or (None, None).
    """
    if not words or not seq_keywords:
        return (None, None)

    n = len(words)
    m = len(seq_keywords)
    if m == 0 or n < m:
        return (None, None)

    seq_keywords = [k.lower() for k in seq_keywords]

    for i in range(n - m + 1):
        matched = True
        for j, key in enumerate(seq_keywords):
            wtext = str(words[i + j][4]).lower()
            if key not in wtext:
                matched = False
                break
        if matched:
            x0, y0, x1, y1, *_ = words[i + m - 1]
            x = x1 + x_pad
            y = (y0 + y1) / 2.0
            return (x, y)

    return (None, None)


def auto_detect_dbt_fields_on_page(page):
    """
    Auto-detect positions for the CURRENT DBT A4 form page.

    Returns a dict with keys like:
      - "branch_line"
      - "bank_only_line"
      - "accountNumber"
      - "fullName"
      - "maintain_account"
      - "aadhaarNumber"
      - "mobileNumber"
      - "email"
      - "option1_tick" ... "option4_tick"
      - "option1_account"
      - "bottom_name"
    """
    words = page.get_text("words")  # (x0, y0, x1, y1, text, block, line, word)
    coords = {}

    # ---- Helper: group words by (block, line_no) ----
    line_words = {}
    for (x0, y0, x1, y1, text, block, line_no, word_no) in words:
        key = (block, line_no)
        line_words.setdefault(key, []).append((x0, y0, x1, y1, text))

    # ---- Simple "after label" coords for some fields ----
    def after_seq_global(seq_keywords, x_pad=10.0):
        seq_keywords_lower = [k.lower() for k in seq_keywords]
        n = len(words)
        m = len(seq_keywords_lower)
        if m == 0 or n < m:
            return (None, None)

        for i in range(n - m + 1):
            matched = True
            for j, key in enumerate(seq_keywords_lower):
                wtext = str(words[i + j][4]).lower()
                if key not in wtext:
                    matched = False
                    break
            if matched:
                x0, y0, x1, y1, *_ = words[i + m - 1]
                x = x1 + x_pad
                y = (y0 + y1) / 2.0
                return (x, y)
        return (None, None)

    # Top "Account No. ______ in A/c Name ______"
    coords["accountNumber"] = after_seq_global(["account", "no"])
    coords["fullName"] = after_seq_global(["a/c", "name"])

    # Aadhaar number line (keep detected, but we will NOT draw Aadhaar text)
    coords["aadhaarNumber"] = after_seq_global(["aadhaar", "number"])

    # Mobile / Email ("Mobile No.:", "Email:")
    coords["mobileNumber"] = after_seq_global(["mobile", "no"])
    coords["email"] = after_seq_global(["email"])

    # ---- Per-line scanning for branch/bank/options/bottom name ----
    for key, wlist in line_words.items():
        text = " ".join(w[4] for w in wlist)
        lower = text.lower()
        cy = sum((w[1] + w[3]) / 2.0 for w in wlist) / len(wlist)

        # 1) Branch line: "……………………….Branch" (not "Branch Manager", not "with your Branch")
        if (
            "branch" in lower
            and "manager" not in lower
            and "with your branch" not in lower
        ):
            # put MORWA a bit inside the dotted area (start of line)
            first = wlist[0]
            x = first[0] + 5
            coords["branch_line"] = (x, cy)

        # 2) Bank line: "……………………….Bank" (avoid other 'bank' sentences & NPCI footnote)
        if (
            "bank" in lower
            and "account" not in lower
            and "benefit" not in lower
            and "of india" not in lower
            and "iin number" not in lower
            and "mapping" not in lower
            and "aadhaar" not in lower
            and "name of bank" not in lower
        ):
            first = wlist[0]
            x = first[0] + 5
            coords["bank_only_line"] = (x, cy)

        # 3) "I am maintaining a Bank account No. ______ with your Branch."
        if "i am maintaining a bank account no" in lower:
            # Put account number just after the word "No"
            placed = False
            for (x0, y0, x1, y1, t) in wlist:
                if "no" in t.lower():
                    coords["maintain_account"] = (x1 + 10, cy)
                    placed = True
                    break
            if not placed:
                # fallback: somewhere in the right half
                last = wlist[-1]
                coords["maintain_account"] = (last[0] - 80, cy)

        # 4) Option 1 line: "I wish to seed my account No. ___ with NPCI mapper"
        if "i wish to seed my account" in lower:
            # tick: just left of first word in this line
            first_word = wlist[0]
            coords["option1_tick"] = (first_word[0] - 15, cy)

            # account blank: between "No." and "with"
            no_word = None
            with_word = None
            for (x0, y0, x1, y1, t) in wlist:
                tl = t.lower()
                if no_word is None and "no" in tl:
                    no_word = (x0, y0, x1, y1)
                if with_word is None and tl.startswith("with"):
                    with_word = (x0, y0, x1, y1)

            if no_word and with_word:
                # center between "No." and "with"
                x_acct = (no_word[2] + with_word[0]) / 2.0
            elif no_word:
                x_acct = no_word[2] + 20
            else:
                x_acct = first_word[0] + 150

            coords["option1_account"] = (x_acct, cy)

        # 5) Option 2
        if (
            "i already have an account with" in lower
            and "change my npci mapping" in lower
        ):
            first_word = wlist[0]
            coords["option2_tick"] = (first_word[0] - 15, cy)

        # 6) Option 3
        if "i already have an account with another bank" in lower:
            first_word = wlist[0]
            coords["option3_tick"] = (first_word[0] - 15, cy)

        # 7) Option 4
        if "i do not wish to seed my accounts" in lower:
            first_word = wlist[0]
            coords["option4_tick"] = (first_word[0] - 15, cy)

        # 8) Bottom "Name :" line (for Name/Mobile/Email block)
        if lower.strip().startswith("name :") or lower.strip().startswith("name:"):
            # place just after the "Name" label
            name_x = None
            for (x0, y0, x1, y1, t) in wlist:
                if "name" in t.lower():
                    name_x = x1 + 10
                    break
            if name_x is None:
                name_x = wlist[0][0] + 60
            coords["bottom_name"] = (name_x, cy)

    return coords


# ================== DBT HELPERS: BANK SHORT NAMES + OPTION MAPPING ==================

BANK_SHORT_NAMES = {
    "STATE BANK OF INDIA": "SBI",
    "PUNJAB NATIONAL BANK": "PNB",
    "BANK OF INDIA": "BOI",
    "BANK OF BARODA": "BOB",
    "UNION BANK OF INDIA": "UBI",
    "CANARA BANK": "CANARA",
    "CENTRAL BANK OF INDIA": "CBI",
    "INDIAN BANK": "INDIAN BANK",
    "INDIAN OVERSEAS BANK": "IOB",
    "UCO BANK": "UCO",
    "BANK OF MAHARASHTRA": "BOM",
    "HDFC BANK": "HDFC",
    "ICICI BANK": "ICICI",
    "AXIS BANK": "AXIS",
    "KOTAK MAHINDRA BANK": "KOTAK",
    "YES BANK": "YES BANK",
    "RBL BANK": "RBL",
    "IDFC FIRST BANK": "IDFC",
}


def _normalize_bank_name(name: str) -> str:
    import re as _re

    return _re.sub(r"\s+", " ", (name or "")).strip().upper()


def shorten_bank_name(name: str, max_len: int = 18) -> str:
    """
    For printing on the tiny '......Bank' line:
    - Use common Indian short forms (SBI, PNB, BOI, etc.)
    - If still long, use initials (except BANK / OF / THE)
    - As a last resort, truncate.
    """
    norm = _normalize_bank_name(name)
    if not norm:
        return ""

    # 1) Known short forms
    if norm in BANK_SHORT_NAMES:
        return BANK_SHORT_NAMES[norm]

    # 2) If it already fits, just use it
    if len(norm) <= max_len:
        return norm

    # 3) Fallback: initials from words
    words = [w for w in norm.split(" ") if w not in {"BANK", "OF", "THE"}]
    initials = "".join(w[0] for w in words if w)
    if initials:
        return initials.upper()

    # 4) Ultimate fallback: truncate
    return norm[:max_len]


def normalize_dbt_option(option: str) -> int:
    """
    Map whatever frontend sends → 1,2,3,4.

    Supports values like your frontend:
      - "link_new", "link_existing", "keep_other", "no_dbt"
    And also:
      - "option1"/"option2"/..., "1"/"2"/...
    """
    if not option:
        return 1

    opt = option.strip().lower()

    # Option 1 types
    if opt in {
        "option1",
        "1",
        "link_new",
        "link-new",
        "new",
        "seed_new",
    }:
        return 1

    # Option 2 types
    if opt in {
        "option2",
        "2",
        "link_existing",
        "link-existing",
        "existing",
        "change_here",
    }:
        return 2

    # Option 3 types
    if opt in {
        "option3",
        "3",
        "keep_other",
        "keep-other",
        "keep_other_bank",
        "other_bank",
        "switch_bank",
        "link_other_bank",
    }:
        return 3

    # Option 4 types
    if opt in {
        "option4",
        "4",
        "no_dbt",
        "no-dbt",
        "dont_link",
        "do_not_link",
        "no-link",
        "no_dbt_benefit",
    }:
        return 4

    # default: behave like option 1
    return 1


# ================== DBT PDF FILLING ENDPOINT (AUTO-ALIGN FOR A4 FORM) ==================

# Use your A4 DBT form as the default template
DEFAULT_DBT_TEMPLATE_PATH = "DBT_form_A4.pdf"  # make sure this file is in the same folder as main.py


@app.post("/fill-dbt-form")
async def fill_dbt_form(
    fullName: str = Form(...),
    aadhaarNumber: str = Form(...),
    accountNumber: str = Form(...),
    ifscCode: str = Form(...),
    bankName: str = Form(...),
    branchName: str = Form(""),
    mobileNumber: str = Form(...),
    email: str = Form(...),
    dbtOption: str = Form(...),
    signature: Optional[str] = Form(None),
    consent: Optional[str] = Form(None),
    dbt_form: Optional[UploadFile] = File(None),
):
    """
    Fill DBT form using auto-detected coordinates for your current A4 NPCI form.
    - Uses a simple character-count based font shrink (no get_text_length).
    - Shortens bank names (SBI / PNB / BOI / etc.) so they fit the small blank.
    - Ticks exactly ONE DBT option (1–4) based on dbtOption from frontend.
    """

    # ----- 0) Normalise incoming values -----
    fullName = (fullName or "").strip()
    aadhaarNumber = (aadhaarNumber or "").strip()
    accountNumber = (accountNumber or "").strip()
    ifscCode = (ifscCode or "").strip().upper()
    bankName_original = (bankName or "").strip()
    branchName = (branchName or "").strip()
    mobileNumber = (mobileNumber or "").strip()
    email = (email or "").strip()
    dbtOption = (dbtOption or "").strip()

    # Short bank name for tiny '......Bank' line
    printable_bank_name = shorten_bank_name(bankName_original)

    # Decide which of the 4 bullets to tick
    selected_option_index = normalize_dbt_option(dbtOption)

    # ----- 1) Choose template -----
    if dbt_form is not None:
        # User uploaded a custom DBT form PDF
        template_path = save_upload_pdf(dbt_form)
        custom = True
    else:
        # Use default A4 DBT form
        if not os.path.exists(DEFAULT_DBT_TEMPLATE_PATH):
            raise HTTPException(
                status_code=500,
                detail="Default DBT template not found.",
            )
        template_path = DEFAULT_DBT_TEMPLATE_PATH
        custom = False

    # ----- 2) Open the PDF safely -----
    try:
        doc = fitz.open(template_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to open DBT PDF: {e}")

    # For the A4 DBT form: always use the first page (index 0)
    page_index = 0
    page = doc[page_index]

    # ----- 3) Auto-detect coordinates on this template -----
    coords = auto_detect_dbt_fields_on_page(page)

    def get_coord(name, default_xy):
        """
        Helper to safely read a coordinate from auto-detect,
        falling back to a tuned default if missing.
        """
        xy = coords.get(name)
        if not xy:
            return default_xy
        x, y = xy
        if x is None or y is None:
            return default_xy
        return xy

    # ----- 4) Helper: draw text with simple auto-shrink -----
    def draw_text(x: float, y: float, text: str, max_chars: int = 30):
        """
        Draw text at (x, y). If text is long, reduce font size a bit so it fits
        better in limited space. Does NOT use page.get_text_length.
        """
        if not text:
            return

        base_font = 10
        min_font = 6

        length = len(text)
        if length <= max_chars:
            font_size = base_font
        else:
            factor = max_chars / float(length)
            font_size = max(min_font, int(base_font * factor))

        page.insert_text((x, y), text, fontsize=font_size, color=(0, 0, 0))

    # ----- 5) Resolve coordinates (auto-detected → fallback to tuned defaults) -----

    # Branch and Bank on separate lines (The Branch Manager header block)
    branch_x, branch_y = get_coord("branch_line", (160, 720))
    bank_x_detected, bank_y_detected = get_coord("bank_only_line", (160, 700))

    # Slight nudge for MORWA
    branch_x += 3.0
    branch_y += 1.0

    # Place SBI ~4–5 mm below MORWA, same x
    bank_x = branch_x
    bank_y = branch_y + 12.0  # ≈4.2 mm

    # Main body fields
    acct_x, acct_y = get_coord("accountNumber", (160, 650))
    name_x, name_y = get_coord("fullName", (360, 650))
    maintain_x, maintain_y = get_coord("maintain_account", (260, 620))

    # Aadhaar line is detected but we will NOT draw Aadhaar text
    # aad_x, aad_y = get_coord("aadhaarNumber", (270, 580))

    mob_x, mob_y = get_coord("mobileNumber", (160, 240))
    email_x, email_y = get_coord("email", (160, 220))

    opt1_tick_x, opt1_tick_y = get_coord("option1_tick", (50, 550))
    opt2_tick_x, opt2_tick_y = get_coord("option2_tick", (50, 520))
    opt3_tick_x, opt3_tick_y = get_coord("option3_tick", (50, 490))
    opt4_tick_x, opt4_tick_y = get_coord("option4_tick", (50, 460))

    opt1_acct_x, opt1_acct_y = get_coord("option1_account", (270, 550))
    # move option-1 account number LEFT overall, but now 2 mm back to the right
    # total ≈ 11 mm left from detected (11 mm * ~2.83 ≈ 31.1 units)
    opt1_acct_x -= 31.1

    bottom_name_x, bottom_name_y = get_coord("bottom_name", (160, 200))

    # Move Name / Mobile / Email slightly DOWN so they sit on the blanks
    shift_down = 4.0  # ≈1.4 mm
    bottom_name_y += shift_down
    mob_y += shift_down
    email_y += shift_down

    # ----- 6) Place text using these coordinates -----

    # 🏦 Branch & Bank (top section, on their own lines)
    draw_text(branch_x, branch_y, branchName, max_chars=40)      # MORWA
    draw_text(bank_x, bank_y, printable_bank_name, max_chars=20) # SBI / short bank

    # 🧾 First line: "Account No. ______ in A/c Name ______"
    draw_text(acct_x, acct_y, accountNumber, max_chars=26)       # Account No.
    draw_text(name_x, name_y, fullName, max_chars=40)            # A/c Name

    # 💳 "I am maintaining a Bank account No. ______"
    draw_text(maintain_x, maintain_y, accountNumber, max_chars=26)

    # 🆔 Aadhaar: DO NOT draw Aadhaar number on the form

    # ===========================
    #         TICK OPTIONS
    # ===========================

    option_tick_coords = {
        1: (opt1_tick_x, opt1_tick_y),
        2: (opt2_tick_x, opt2_tick_y),
        3: (opt3_tick_x, opt3_tick_y),
        4: (opt4_tick_x, opt4_tick_y),
    }

    cx, cy = option_tick_coords.get(selected_option_index, (opt1_tick_x, opt1_tick_y))

    # small nudge so ✓ visually sits in the circle
    cy_adjusted = cy + 2

    # Draw EXACTLY ONE tick (✓)
    page.insert_text((cx - 1, cy_adjusted), "✓", fontsize=14, color=(0, 0, 0))

    # Write Account Number in Option 1 line ONLY if option 1 is selected
    if selected_option_index == 1:
        draw_text(opt1_acct_x, opt1_acct_y, accountNumber, max_chars=26)

    # ✍ Bottom: Name near "Name :" label
    draw_text(bottom_name_x, bottom_name_y, fullName, max_chars=40)

    # 📱 Mobile no. aligned with "Mobile No.:"
    draw_text(mob_x, mob_y, mobileNumber, max_chars=20)

    # 📧 Email aligned with "Email:"
    draw_text(email_x, email_y, email, max_chars=40)

    # ----- 7) Save and return file -----
    out_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    output_path = out_tmp.name
    out_tmp.close()

    doc.save(output_path)
    doc.close()

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="DBT_Application_Filled.pdf",
    )
