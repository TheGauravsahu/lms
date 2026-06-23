import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Download, Printer } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export const CertificateModal = ({ isOpen, onClose, courseTitle }) => {
  const user = useAuthStore((state) => state.user);
  const studentName = user?.name || "Student";
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadCertificate = () => {
    const svgElement = document.getElementById("certificate-svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600; // Generate double resolution for crisp printing!
      canvas.height = 1200;
      const context = canvas.getContext("2d");
      context.scale(2, 2);
      context.drawImage(image, 0, 0);

      const png = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = png;
      downloadLink.download = `${courseTitle.replace(/\s+/g, "_")}_Certificate.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const printCertificate = () => {
    const svgElement = document.getElementById("certificate-svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${courseTitle}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; }
            svg { max-width: 100%; max-height: 100%; object-fit: contain; }
            @media print {
              body { background: #fff; }
              svg { width: 100%; height: 100%; }
            }
          </style>
        </head>
        <body>
          ${svgString}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl  h-[90vh] dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <Award className="w-6 h-6 animate-pulse" />
            Claim Course Certificate
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Congratulations on completing <strong>{courseTitle}</strong>! Here
            is your verified certificate of completion.
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Rendering Container */}
        <div className="my-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 flex justify-center p-2 sm:p-4">
          <svg
            id="certificate-svg"
            width="800"
            height="600"
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-h-[450px] object-contain rounded-md"
          >
            {/* Background */}
            <rect width="800" height="600" fill="#0b0f19" />

            {/* Decorative corners */}
            <path d="M 0 0 L 80 0 L 0 80 Z" fill="#f97316" opacity="0.7" />
            <path d="M 800 0 L 720 0 L 800 80 Z" fill="#f97316" opacity="0.7" />
            <path d="M 0 600 L 80 600 L 0 520 Z" fill="#f97316" opacity="0.7" />
            <path
              d="M 800 600 L 720 600 L 800 520 Z"
              fill="#f97316"
              opacity="0.7"
            />

            {/* Inner Border */}
            <rect
              x="25"
              y="25"
              width="750"
              height="550"
              fill="none"
              stroke="#f97316"
              stroke-width="4"
              rx="8"
            />
            <rect
              x="35"
              y="35"
              width="730"
              height="530"
              fill="none"
              stroke="#e2e8f0"
              stroke-width="1"
              stroke-dasharray="6,4"
              rx="6"
              opacity="0.2"
            />

            {/* Heading text */}
            <text
              x="400"
              y="110"
              text-anchor="middle"
              fill="#f97316"
              font-family="'Cinzel', Georgia, serif"
              font-size="34"
              font-weight="bold"
              letter-spacing="3"
            >
              CERTIFICATE OF COMPLETION
            </text>
            <text
              x="400"
              y="150"
              text-anchor="middle"
              fill="#94a3b8"
              font-family="sans-serif"
              font-size="14"
              font-weight="600"
              letter-spacing="2"
            >
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </text>

            {/* Student name */}
            <text
              x="400"
              y="240"
              text-anchor="middle"
              fill="#ffffff"
              font-family="'Cinzel', Georgia, serif"
              font-size="44"
              font-weight="bold"
            >
              {studentName}
            </text>
            <line
              x1="200"
              y1="270"
              x2="600"
              y2="270"
              stroke="#f97316"
              stroke-width="2"
            />

            {/* Completion details */}
            <text
              x="400"
              y="320"
              text-anchor="middle"
              fill="#94a3b8"
              font-family="sans-serif"
              font-size="15"
              font-style="italic"
            >
              for successfully finishing and completing all requirements for the
              course
            </text>
            <text
              x="400"
              y="370"
              text-anchor="middle"
              fill="#f97316"
              font-family="sans-serif"
              font-size="24"
              font-weight="bold"
              letter-spacing="1"
            >
              {courseTitle}
            </text>

            {/* Completion date */}
            <text
              x="400"
              y="430"
              text-anchor="middle"
              fill="#64748b"
              font-family="sans-serif"
              font-size="14"
            >
              Issued on {completionDate}
            </text>

            {/* Verification Seal */}
            <circle cx="400" cy="505" r="32" fill="#f97316" opacity="0.15" />
            <circle
              cx="400"
              cy="505"
              r="26"
              fill="none"
              stroke="#f97316"
              stroke-width="2"
            />
            <path
              d="M 390 500 L 400 482 L 410 500 L 400 518 Z"
              fill="#f97316"
            />
            <text
              x="400"
              y="555"
              text-anchor="middle"
              fill="#f97316"
              font-family="sans-serif"
              font-size="10"
              font-weight="bold"
              letter-spacing="1"
            >
              VERIFIED CREDENTIAL
            </text>

            {/* Signatures */}
            <text
              x="160"
              y="505"
              text-anchor="middle"
              fill="#ffffff"
              font-family="cursive"
              font-size="20"
            >
              Gaurav Sahu
            </text>
            <line
              x1="90"
              y1="515"
              x2="230"
              y2="515"
              stroke="#334155"
              stroke-width="1.5"
            />
            <text
              x="160"
              y="530"
              text-anchor="middle"
              fill="#64748b"
              font-family="sans-serif"
              font-size="12"
            >
              Instructor
            </text>

            <text
              x="640"
              y="505"
              text-anchor="middle"
              fill="#ffffff"
              font-family="sans-serif"
              font-size="18"
              font-weight="bold"
            >
              Gaurav LMS
            </text>
            <line
              x1="570"
              y1="515"
              x2="710"
              y2="515"
              stroke="#334155"
              stroke-width="1.5"
            />
            <text
              x="640"
              y="530"
              text-anchor="middle"
              fill="#64748b"
              font-family="sans-serif"
              font-size="12"
            >
              Authorized Signature
            </text>
          </svg>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={printCertificate}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white cursor-pointer"
            onClick={downloadCertificate}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
