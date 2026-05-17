"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FaDownload, FaPrint, FaTimes, FaHome } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

type CertificateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  userName?: string;
  courseLevel?: string;
  issuedDate?: string;
  certificateId?: string;
};

const CertificateModal = ({
  isOpen,
  onClose,
  courseName,
  userName = "Student",
  courseLevel = "Professional",
  issuedDate,
  certificateId,
}: CertificateModalProps) => {
  const router = useRouter();
  const handleDownload = () => {
    const element = document.getElementById("certificate-content");
    if (element) {
      const html = element.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Course Certificate</title>
              <style>
                body { margin: 0; padding: 20px; background: white; font-family: Georgia, serif; }
                .certificate { 
                  background: white;
                  padding: 60px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  max-width: 900px;
                  margin: 0 auto;
                  color: #1a1a1a;
                  text-align: center;
                  page-break-after: always;
                  border: 3px solid #000;
                }
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handlePrint = () => {
    const element = document.getElementById("certificate-content");
    if (element) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Course Certificate</title>
              <style>
                @media print {
                  body { margin: 0; padding: 0; }
                  .certificate { page-break-after: always; }
                }
                body { margin: 0; padding: 20px; background: white; font-family: Georgia, serif; }
                .certificate { 
                  background: white;
                  padding: 60px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  max-width: 900px;
                  margin: 0 auto;
                  color: #1a1a1a;
                  text-align: center;
                  border: 3px solid #000;
                }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>🎓 Course Completion Certificate</DialogTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </DialogHeader>

        {/* Certificate Preview */}
        <div id="certificate-content" className="w-full bg-nova-card rounded-lg p-12 text-center text-nova-heading shadow-2xl border-4 border-black">
          {/* Certificate Border */}
          <div className="border-4 border-black rounded-lg p-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-2 text-nova-heading">Certificate of Completion</h1>
              <div className="flex justify-center gap-2 mb-4">
                <div className="h-1 w-20 bg-black"></div>
                <div className="h-1 w-20 bg-black"></div>
                <div className="h-1 w-20 bg-black"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-8">
              <p className="text-xl mb-4 text-gray-800">This Certifies That</p>
              <h2 className="text-4xl font-bold mb-6 text-nova-heading">{userName}</h2>

              <p className="text-lg text-gray-800 mb-2">Has Successfully Completed the Course</p>
              <h3 className="text-3xl font-bold mb-6 text-nova-heading">{courseName}</h3>

              <p className="text-base text-gray-700 mb-2">
                {courseLevel && `Course Level: ${courseLevel}`}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-6 my-10 border-t-2 border-b-2 border-black py-8">
              <div>
                <p className="text-sm text-gray-700 mb-1">Issued By</p>
                <p className="text-lg font-semibold text-nova-heading">UpSkillAi</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Date of Issue</p>
                <p className="text-lg font-semibold text-nova-heading">{issuedDate || new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Certificate ID</p>
                <p className="text-sm font-mono font-semibold text-nova-heading">{certificateId || "N/A"}</p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="mt-8">
              <p className="text-sm text-gray-700 mb-4">Verified and Authenticated</p>
              <p className="text-center italic text-nova-heading text-sm font-semibold">
                &ldquo;Excellence in Learning - Powered by UpSkillAi&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 justify-center mt-6">
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDownload}
              className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
            >
              <FaDownload /> Download Certificate
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-black text-nova-heading hover:bg-gray-100 dark:bg-nova-card/10 flex items-center gap-2"
            >
              <FaPrint /> Print Certificate
            </Button>
          </div>
          <Button
            onClick={() => {
              onClose();
              window.location.href = "/dashboard";
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center gap-2"
          >
            <FaHome /> Return to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
