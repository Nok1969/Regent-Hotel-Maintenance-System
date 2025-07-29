import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Table, Calendar } from "lucide-react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [exportType, setExportType] = useState<"pdf" | "excel">("pdf");

  const getFilteredData = () => {
    if (selectedPeriod === "all") {
      return data;
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1month":
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "2months":
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        break;
      case "current":
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return data;
    }

    // For repairs, filter by createdAt; for stats, return all data (stats are real-time)
    if (type === "repairs") {
      return data.filter((item: any) => new Date(item.createdAt) >= cutoffDate);
    } else {
      // For stats, we still show the period in the report but use current data
      return data;
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const filteredData = getFilteredData();
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 20, 20);
      
      // Add date and period info
      doc.setFontSize(12);
      doc.text(`วันที่: ${new Date().toLocaleDateString('th-TH')}`, 20, 30);
      
      let periodText = "";
      if (selectedPeriod === "1month") periodText = "ข้อมูล 1 เดือนย้อนหลัง";
      else if (selectedPeriod === "2months") periodText = "ข้อมูล 2 เดือนย้อนหลัง";
      else if (selectedPeriod === "current") periodText = "ข้อมูลเดือนปัจจุบัน";
      else periodText = "ข้อมูลทั้งหมด";
      
      doc.text(periodText, 20, 40);
      
      if (type === "repairs") {
        // Prepare repair data for table
        const tableData = filteredData.map((repair, index) => [
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
          startY: 50,
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
          startY: 50,
          styles: { fontSize: 12 },
          headStyles: { fillColor: [255, 152, 0] },
        });
      }
      
      const finalFilename = selectedPeriod === "all" ? filename : `${filename}-${selectedPeriod}`;
      doc.save(`${finalFilename}.pdf`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const filteredData = getFilteredData();
      let worksheetData;
      
      if (type === "repairs") {
        worksheetData = filteredData.map((repair, index) => ({
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
      const finalFilename = selectedPeriod === "all" ? filename : `${filename}-${selectedPeriod}`;
      saveAs(blob, `${finalFilename}.xlsx`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportType === "pdf") {
      exportToPDF();
    } else {
      exportToExcel();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isExporting}
          className="bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Export ข้อมูล
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>รูปแบบไฟล์</Label>
            <Select value={exportType} onValueChange={(value: "pdf" | "excel") => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Excel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ช่วงเวลาข้อมูล</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ข้อมูลทั้งหมด</SelectItem>
                <SelectItem value="current">เดือนปัจจุบัน</SelectItem>
                <SelectItem value="1month">1 เดือนย้อนหลัง</SelectItem>
                <SelectItem value="2months">2 เดือนย้อนหลัง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex gap-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "กำลัง Export..." : "Export"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}