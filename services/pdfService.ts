import jsPDF from "jspdf";
import { FormData } from "../types";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 40;
const LINE_HEIGHT = 14;

type TemplateBackground = {
  title: string;
  subtitle: string;
  accent: string;
  watermark: string;
};

const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1754;

let cachedBackgrounds: (string | null)[] | null = null;

const createTemplateBackground = ({
  title,
  subtitle,
  accent,
  watermark,
}: TemplateBackground): string | null => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#f8fafc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
  ctx.fillRect(80, 390, canvas.width - 160, canvas.height - 520);

  ctx.fillStyle = accent;
  ctx.font = "bold 54px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(title, 110, 140);

  ctx.fillStyle = "#0f172a";
  ctx.font = "28px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(subtitle, 110, 190);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = accent;
  ctx.font = "bold 180px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(
    watermark,
    -ctx.measureText(watermark).width / 2,
    60
  );
  ctx.restore();

  return canvas.toDataURL("image/png");
};

const getPageBackgrounds = (): (string | null)[] => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return [];
  }
  if (cachedBackgrounds) return cachedBackgrounds;
  cachedBackgrounds = [
    createTemplateBackground({
      title: "Aadhaar Seeding Guidance",
      subtitle: "Official NPCI instructions for DBT readiness",
      accent: "#0891b2",
      watermark: "GUIDE",
    }),
    createTemplateBackground({
      title: "Customer Support & Grievance",
      subtitle: "Know the escalation ladder before submission",
      accent: "#10b981",
      watermark: "NPCI",
    }),
    createTemplateBackground({
      title: "Annexure I Application",
      subtitle: "Fill, sign and submit to your preferred bank",
      accent: "#f97316",
      watermark: "FORM",
    }),
  ];
  return cachedBackgrounds;
};

const addFooter = (doc: jsPDF, pageNumber: number) => {
  doc.setFontSize(9);
  doc.setFont("times", "normal");
  doc.text(`Page ${pageNumber} of 3`, MARGIN, A4_HEIGHT - 30);
  doc.text("Public - NACH", A4_WIDTH / 2 - 20, A4_HEIGHT - 30);
};

const addNumberedList = (
  doc: jsPDF,
  items: string[],
  startY: number,
  indent = 0
) => {
  let y = startY;
  items.forEach((item, index) => {
    const formatted = `${index + 1}. ${item}`;
    const lines = doc.splitTextToSize(
      formatted,
      A4_WIDTH - MARGIN * 2 - indent
    );
    doc.text(lines, MARGIN + indent, y);
    y += lines.length * LINE_HEIGHT;
  });
  return y;
};

const drawCheckbox = (
  doc: jsPDF,
  label: string,
  y: number,
  checked: boolean
) => {
  const boxSize = 10;
  doc.rect(MARGIN, y - boxSize + 2, boxSize, boxSize);
  if (checked) {
    doc.setFont("helvetica", "bold");
    doc.text("✓", MARGIN + 2.5, y - 1);
    doc.setFont("times", "normal");
  }
  const text = doc.splitTextToSize(label, A4_WIDTH - MARGIN * 2 - 16);
  doc.text(text, MARGIN + boxSize + 6, y);
  return y + text.length * LINE_HEIGHT;
};

const renderGuidancePage = (doc: jsPDF) => {
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("Aadhaar seeding process", MARGIN, 70);

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  const intro =
    "Aadhaar seeding is necessitated for receiving Direct Benefit Transfers (DBT) provided by various Government schemes. The following is the process flow of Aadhaar seeding:";
  doc.text(doc.splitTextToSize(intro, A4_WIDTH - MARGIN * 2), MARGIN, 100);

  let y = addNumberedList(
    doc,
    [
      "Customer to visit the bank branch where he/ she is holding an account and submit the duly filled consent form - Annexure I.",
      "The bank officials after verifying the details and documents provided (as may be required) and authenticity of the customer based on the signature will accept Aadhaar seeding consent form and provide an acknowledgement to the customer.",
      "The branch will link the Aadhaar number to the customer's account and also in NPCI mapper.",
      "Once this activity is completed and Aadhaar number will reflect in NPCI mapper.",
    ],
    140
  );

  doc.setFont("times", "bold");
  doc.text("Role of the customer:", MARGIN, y + LINE_HEIGHT);
  doc.setFont("times", "normal");
  y = addNumberedList(
    doc,
    [
      "Submit the consent form with complete details either in physical or electronic form as per the facility provided by his / her bank.",
      "In case of moving Aadhaar number from one bank to another bank, the customer should provide the name of the bank from which the Aadhaar is being moved.",
      "In case of physical form, the consent form should be duly signed as per the bank records.",
      "After seeding is completed the customer may approach their Gas service provider (Oil Marketing Company) for the pending subsidy amount.",
      "For non-receipt of subsidies customer to approach respective OMC's through their toll free number : 1800 2333 555.",
    ],
    y + LINE_HEIGHT * 2
  );

  doc.setFont("times", "bold");
  doc.text("Role of the Bank / Branch:", MARGIN, y + LINE_HEIGHT);
  doc.setFont("times", "normal");
  y = addNumberedList(
    doc,
    [
      "Verifying the completeness of the consent form, checking the documentation and authenticating the customer's signature.",
      "After the officials are satisfied with the documentation they should carry out the following activities\n   a. Linking the Aadhaar number to the bank account (in CBS)\n   b. Updating NPCI mapper\n   Note: By linking the Aadhaar number to the account the branch is not updating the mapper. The mapper update process has to be followed by their central team or IT division as the case may be.",
      "After the mapper files are uploaded the response files received from NPCI have to be verified.",
      "In case of failure in updating any Aadhaar number's then necessary corrective action has to be taken and CBS also should be updated accordingly.",
      "Customer query / complaint handling\n   1. Branches should understand that if Aadhaar number is not updated in NPCI mapper the action is purely lies with the bank only. The customer should not be told that NPCI has not updated the Aadhaar number.\n   2. Aadhaar number being active in bank's CBS does not mean that mapper file is updated, the branch should not show CBS screen or provide screen shot to the customer confirming seeding.\n   3. If the customer complaints, the branch should approach their internal team handling Aadhaar mapping and ascertain the reason for non-updating the Aadhaar in NPCI mapper.\n   4. After ascertaining the root cause bank should take corrective action and redress the grievance of the customer.",
    ],
    y + LINE_HEIGHT * 2
  );

  doc.setFont("times", "bold");
  doc.text("Responsibility of NPCI:", MARGIN, y + LINE_HEIGHT);
  doc.setFont("times", "normal");
  addNumberedList(
    doc,
    [
      "Mapper is a platform provided by NPCI for the banks to update or remove Aadhaar numbers as per their customer's request.",
      "The activity of updating or removing an Aadhaar number from mapper can be performed only by the banks.",
      "NPCI on its own does not update the mapper records.",
      "In case customer approaches NPCI for grievance redressal, NPCI will have to reach out to the teams concerned in banks for necessary action.",
      "NPCI will ensure that mapper platform is available, files submitted by banks are processed and response is provided.",
    ],
    y + LINE_HEIGHT * 2
  );

  addFooter(doc, 1);
};

const renderGrievancePage = (doc: jsPDF) => {
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Customer grievance:", MARGIN, 70);

  doc.setFont("times", "normal");
  let y = addNumberedList(
    doc,
    [
      "If the Aadhaar number is not reflecting in NPCI mapper after submitting all the relevant documents to the bank the action rests with the bank only.",
      "The customer should approach the bank's customer service cell for grievance redressal and follow escalation matrix if the issue is not resolved.",
      "If customer wants to write to NPCI then the copy of the consent form duly acknowledged by the bank should be provided for taking up with the bank concerned.",
      "For any escalations customer may write to npci.dbt@npci.org.in with Aadhaar consent acknowledgment copy provided by the bank.",
    ],
    90
  );

  doc.setFont("times", "bold");
  doc.text("Additional information:", MARGIN, y + LINE_HEIGHT);
  doc.setFont("times", "normal");
  const bulletText = [
    "Customer can link only one account with Aadhaar at any point of time.",
    "If customer gives consent to multiple banks then subsidy will be credited to the last seeded bank with which the status is active in NPCI mapper.",
    "If Aadhaar status is inactive, customer to visit respective bank branch in person and submit the duly filled customer consent form.",
    "OMC's to be approached for reinitiating the failed transactions to last seeded bank account.",
  ];

  let currentY = y + LINE_HEIGHT * 2;
  bulletText.forEach((text) => {
    const lines = doc.splitTextToSize(`• ${text}`, A4_WIDTH - MARGIN * 2);
    doc.text(lines, MARGIN, currentY);
    currentY += lines.length * LINE_HEIGHT;
  });

  addFooter(doc, 2);
};

const renderApplicationPage = (doc: jsPDF, data: FormData) => {
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text(
    "APPLICATION FOR LINKING/ SEEDING AADHAAR NUMBER",
    MARGIN,
    60,
    { maxWidth: A4_WIDTH - MARGIN * 2 }
  );
  doc.text(
    "AND RECEIVING DBT BENEFITS INTO BANK ACCOUNT - (NPCI MAPPING)",
    MARGIN,
    80,
    { maxWidth: A4_WIDTH - MARGIN * 2 }
  );

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  let y = 110;

  const branchBlock = [
    `The Branch Manager,`,
    `${data.bankName || "________________"} Branch`,
    `${data.bankName || "________________"} Bank`,
  ];
  branchBlock.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  });

  const accountSection = [
    `Account No.: ${data.accountNumber || "_____________________"}`,
    `A/c Name: ${data.fullName || "_____________________"} `,
  ];
  accountSection.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  });

  y += LINE_HEIGHT;
  const subject =
    "Linking / Seeding of Aadhaar in NPCI-Mapping for Receiving Direct Benefits";
  doc.text(subject, MARGIN, y);

  y += LINE_HEIGHT * 2;
  const paragraph = `I am maintaining a bank account No. ${
    data.accountNumber || "_____________________"
  } with your branch. I submit my Aadhaar number and voluntarily give my consent to:`;
  doc.text(doc.splitTextToSize(paragraph, A4_WIDTH - MARGIN * 2), MARGIN, y);

  y += LINE_HEIGHT * 3;
  const consentPoints = [
    "Use my Aadhaar Details to authenticate me from UIDAI.",
    "Use my Mobile number mentioned below for sending SMS Alerts to me.",
    "Link the Aadhaar Number to all my existing/new/future accounts and customer profile (CIF) with your Bank.",
  ];

  consentPoints.forEach((point) => {
    const lines = doc.splitTextToSize(`• ${point}`, A4_WIDTH - MARGIN * 2);
    doc.text(lines, MARGIN, y);
    y += lines.length * LINE_HEIGHT;
  });

  y += LINE_HEIGHT;
  doc.setFont("times", "bold");
  doc.text("OPTION FOR RECEIVING DBT BENEFITS (TICK ONE)", MARGIN, y);
  doc.setFont("times", "normal");
  y += LINE_HEIGHT * 1.5;

  const options: Record<string, string> = {
    link_new:
      "I wish to seed my account No. ____________ with NPCI mapper to enable me to receive Direct Benefit Transfer (DBT) including LPG Subsidy from Govt. of India (GOI) in my above account.",
    change_account:
      "I already have an account with another Bank having IIN Number** ________ and seeded with NPCI Mapper for receiving DBT from GOI. I request you to change my NPCI mapping (DBT Benefit Account) to my account with your Bank.",
    dbt_only:
      "I already have an account with another Bank ________ (name of Bank) having IIN Number** ________ and seeded with NPCI Mapper for receiving DBT from GOI. I do not want to change my NPCI mapping (DBT Benefit Account) from the existing Bank.",
  };

  const selectedOption = data.dbtOption || "link_new";
  y = Object.entries(options).reduce((cursor, [key, label]) => {
    const checked = selectedOption === key;
    return drawCheckbox(doc, label, cursor, checked) + LINE_HEIGHT / 2;
  }, y);

  y += LINE_HEIGHT;
  const declaration =
    "I have been explained about the nature of information that may be shared upon authentication. I have been given to understand that my information submitted to the bank herewith shall not be used for any purpose other than mentioned above, or as per requirements of law.";
  doc.text(doc.splitTextToSize(declaration, A4_WIDTH - MARGIN * 2), MARGIN, y);

  y += LINE_HEIGHT * 4;
  doc.text(
    "I hereby declare that all the above information voluntarily furnished by me is true, correct and complete.",
    MARGIN,
    y
  );

  y += LINE_HEIGHT * 2;
  doc.text("Yours faithfully,", MARGIN, y);
  y += LINE_HEIGHT * 1.5;

  if (data.signature) {
    doc.addImage(data.signature, "PNG", MARGIN, y, 120, 50);
  } else {
    doc.text("__________________________", MARGIN, y + 20);
  }
  doc.text("(Signature/ Thumb Impression of customer)", MARGIN, y + 70);

  y += 100;
  doc.text(`Name: ${data.fullName || ""}`, MARGIN, y);
  y += LINE_HEIGHT;
  doc.text(`Mobile No.: ${data.mobileNumber || ""}`, MARGIN, y);
  y += LINE_HEIGHT;
  doc.text(`Email: ${data.email || ""}`, MARGIN, y);
  y += LINE_HEIGHT;
  doc.text("Encl: Copy of Aadhaar", MARGIN, y);

  addFooter(doc, 3);
};

const applyBackground = (doc: jsPDF, background?: string | null) => {
  if (!background) return;
  doc.addImage(
    background,
    "PNG",
    0,
    0,
    doc.internal.pageSize.getWidth(),
    doc.internal.pageSize.getHeight()
  );
};

const openPdf = (doc: jsPDF) => {
  if (typeof window === "undefined") {
    doc.save("NPCI_Aadhaar_Seeding_Form.pdf");
    return;
  }
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  doc.save("NPCI_Aadhaar_Seeding_Form.pdf");
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const generateFilledPdf = (data: FormData): void => {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const backgrounds = getPageBackgrounds();

  applyBackground(doc, backgrounds[0]);
  renderGuidancePage(doc);

  doc.addPage("a4", "portrait");
  applyBackground(doc, backgrounds[1]);
  renderGrievancePage(doc);

  doc.addPage("a4", "portrait");
  applyBackground(doc, backgrounds[2]);
  renderApplicationPage(doc, data);

  openPdf(doc);
};
