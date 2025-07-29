import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: "repairs" | "stats";
  title: string;
}

export function ExportButton({ data, filename, type, title }: ExportButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`วันที่: ${new Date().toLocaleDateString('th-TH')}`, 20, 30);
      
      if (type === "repairs") {
        // Prepare repair data for table
        const tableData = data.map((repair, index) => [
          index + 1,
          repair.room || "",
          repair.category === "electrical" ? "ไฟฟ้า" :
          repair.category === "plumbing" ? "ประปา" :
          repair.category === "air_conditioning" ? "แอร์" :
          repair.category === "furniture" ? "เฟอร์นิเจอร์" : "อื่นๆ",
          repair.urgency === "high" ? "สูง" :
          repair.urgency === "medium" ? "กลาง" : "ต่ำ",
          repair.status === "pending" ? "รอดำเนินการ" :
          repair.status === "in_progress" ? "กำลังดำเนินการ" : "เสร็จสิ้น",
          repair.description || "",
          new Date(repair.createdAt).toLocaleDateString('th-TH')
        ]);

        (doc as any).autoTable({
          head: [['ลำดับ', 'ห้อง', 'ประเภท', 'ความเร่งด่วน', 'สถานะ', 'รายละเอียด', 'วันที่']],
          body: tableData,
          startY: 40,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [255, 152, 0] },
        });
      } else if (type === "stats") {
        // Stats export
        const statsData = [
          ['รายการทั้งหมด', data.find(d => d.label === 'Total')?.value || 0],
          ['รอดำเนินการ', data.find(d => d.label === 'Pending')?.value || 0],
          ['กำลังดำเนินการ', data.find(d => d.label === 'In Progress')?.value || 0],
          ['เสร็จสิ้น', data.find(d => d.label === 'Completed')?.value || 0],
        ];

        (doc as any).autoTable({
          head: [['รายการ', 'จำนวน']],
          body: statsData,
          startY: 40,
          styles: { fontSize: 12 },
          headStyles: { fillColor: [255, 152, 0] },
        });
      }
      
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      let worksheetData;
      
      if (type === "repairs") {
        worksheetData = data.map((repair, index) => ({
          'ลำดับ': index + 1,
          'ห้อง': repair.room || "",
          'ประเภท': repair.category === "electrical" ? "ไฟฟ้า" :
                   repair.category === "plumbing" ? "ประปา" :
                   repair.category === "air_conditioning" ? "แอร์" :
                   repair.category === "furniture" ? "เฟอร์นิเจอร์" : "อื่นๆ",
          'ความเร่งด่วน': repair.urgency === "high" ? "สูง" :
                         repair.urgency === "medium" ? "กลาง" : "ต่ำ",
          'สถานะ': repair.status === "pending" ? "รอดำเนินการ" :
                  repair.status === "in_progress" ? "กำลังดำเนินการ" : "เสร็จสิ้น",
          'รายละเอียด': repair.description || "",
          'วันที่': new Date(repair.createdAt).toLocaleDateString('th-TH'),
          'ผู้แจ้ง': repair.requesterId || ""
        }));
      } else if (type === "stats") {
        worksheetData = [
          { 'รายการ': 'รายการทั้งหมด', 'จำนวน': data.find(d => d.label === 'Total')?.value || 0 },
          { 'รายการ': 'รอดำเนินการ', 'จำนวน': data.find(d => d.label === 'Pending')?.value || 0 },
          { 'รายการ': 'กำลังดำเนินการ', 'จำนวน': data.find(d => d.label === 'In Progress')?.value || 0 },
          { 'รายการ': 'เสร็จสิ้น', 'จำนวน': data.find(d => d.label === 'Completed')?.value || 0 },
        ];
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isExporting}
          className="bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "กำลัง Export..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export เป็น PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="h-4 w-4 mr-2" />
          Export เป็น Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}