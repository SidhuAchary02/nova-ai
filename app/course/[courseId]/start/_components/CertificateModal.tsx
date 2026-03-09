"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
                body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Georgia, serif; }
                .certificate { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 60px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  max-width: 900px;
                  margin: 0 auto;
                  color: white;
                  text-align: center;
                  page-break-after: always;
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
                body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Georgia, serif; }
                .certificate { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 60px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  max-width: 900px;
                  margin: 0 auto;
                  color: white;
                  text-align: center;
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
        <div id="certificate-content" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg p-12 text-center text-white shadow-2xl">
          {/* Certificate Border */}
          <div className="border-4 border-white/30 rounded-lg p-10 backdrop-blur-sm">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-2">Certificate of Completion</h1>
              <div className="flex justify-center gap-2 mb-4">
                <div className="h-1 w-20 bg-white/50"></div>
                <div className="h-1 w-20 bg-white/50"></div>
                <div className="h-1 w-20 bg-white/50"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-8">
              <p className="text-xl mb-4 opacity-90">This Certifies That</p>
              <h2 className="text-4xl font-bold mb-6 text-yellow-100">{userName}</h2>

              <p className="text-lg opacity-90 mb-2">Has Successfully Completed the Course</p>
              <h3 className="text-3xl font-bold mb-6 text-yellow-100">{courseName}</h3>

              <p className="text-base opacity-90 mb-2">
                {courseLevel && `Course Level: ${courseLevel}`}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-6 my-10 border-t border-b border-white/30 py-8">
              <div>
                <p className="text-sm opacity-75 mb-1">Issued By</p>
                <p className="text-lg font-semibold">Nova AI</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Date of Issue</p>
                <p className="text-lg font-semibold">{issuedDate || new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Certificate ID</p>
                <p className="text-sm font-mono font-semibold">{certificateId || "N/A"}</p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="mt-8">
              <p className="text-sm opacity-75 mb-4">Verified and Authenticated</p>
              <p className="text-center italic text-yellow-100 text-sm">
                "Excellence in Learning - Powered by Nova AI"
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <Button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <FaDownload /> Download Certificate
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaPrint /> Print Certificate
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
