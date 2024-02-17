---
layout: post
title: "NPOI操作excel的一些方法代码示例"
date: 2022/8/11 18:49:21
author: "邱陈程"
tags:
- C#
- 程序
---

```c#
//创建工作簿
IWorkbook workbook = new XSSFWorkbook();
//创建工作表
workbook.CreateSheet("Sheet A1");
workbook.CreateSheet("Sheet A2");
workbook.CreateSheet("Sheet A3");
//起文件流
FileStream sw = File.Create("test.xlsx");
//写入文件
workbook.Write(sw);
//文件流关闭
sw.Close();

//创建工作表
ISheet sheet1 = workbook.CreateSheet("Sheet1");
//创建单元格，以及单元格填入值
sheet1.CreateRow(0).CreateCell(0).SetCellValue("This is a Sample");

//单元格背景调整
ICellStyle style1 = workbook.CreateCellStyle();
style1.FillForegroundColor = NPOI.HSSF.Util.HSSFColor.Blue.Index2;
style1.FillPattern = FillPattern.SolidForeground;
cell.CellStyle = style1;

//调整列宽
IWorkbook workbook = new XSSFWorkbook();
ISheet sheet1=workbook.CreateSheet("Monthly Salary Report");
IRow headerRow = sheet1.CreateRow(0);
headerRow.CreateCell(0).SetCellValue("First Name");
sheet1.SetColumnWidth(0, 20 * 256);
headerRow.CreateCell(1).SetCellValue("Last Name");
sheet1.SetColumnWidth(1, 20 * 256);


////超链接的单元格式
////超链接是蓝色字体，带下划线
ICellStyle hlink_style = workbook.CreateCellStyle();
IFont hlink_font = workbook.CreateFont();
hlink_font.Underline = FontUnderlineType.Single;
hlink_font.Color = HSSFColor.Blue.Index;
hlink_style.SetFont(hlink_font);

//URL超链接
ICell cell;
cell = sheet.CreateRow(0).CreateCell(0);
cell.SetCellValue("URL Link");
XSSFHyperlink link = new XSSFHyperlink(HyperlinkType.Url);
link.Address = ("http://poi.apache.org/");
cell.Hyperlink = (link);
cell.CellStyle = (hlink_style);

//创建目标表和目标单元格的超链接
ISheet sheet2 = workbook.CreateSheet("Target ISheet");
sheet2.CreateRow(0).CreateCell(0).SetCellValue("Target ICell");
cell = sheet.CreateRow(3).CreateCell(0);
cell.SetCellValue("Worksheet Link");
link = new XSSFHyperlink(HyperlinkType.Document);
link.Address = ("'Target ISheet'!A1");
cell.Hyperlink = (link);
cell.CellStyle = (hlink_style);

//打开表格
FileStream file = File.OpenRead(@"clothes.xlsx");
IWorkbook workbook = new XSSFWorkbook(file);

//获取表里的图片文件
IList pictures = workbook.GetAllPictures();
int i = 0;
foreach (IPictureData pic in pictures)
{
	string ext = pic.SuggestFileExtension();
	if (ext.Equals("jpeg"))
	{
		Image jpg = Image.FromStream(new MemoryStream(pic.Data));
		jpg.Save(string.Format("pic{0}.jpg",i++));
	}
	else if (ext.Equals("png"))
	{
		Image png = Image.FromStream(new MemoryStream(pic.Data));
		png.Save(string.Format("pic{0}.png", i++));
	}
}

//隐藏行和列
//hide IRow 2
r2.ZeroHeight = true;
//hide column C
s.SetColumnHidden(2, true);

//插入图片
IDrawing patriarch = sheet1.CreateDrawingPatriarch();
//create the anchor
XSSFClientAnchor anchor = new XSSFClientAnchor(500, 200, 0, 0, 2, 2, 4, 7);
anchor.AnchorType =  AnchorType.MoveDontResize;
//load the picture and get the picture index in the workbook
//first picture
int imageId= LoadImage("../../image/HumpbackWhale.jpg", workbook);
XSSFPicture picture = (XSSFPicture)patriarch.CreatePicture(anchor, imageId);
//Reset the image to the original size.
//picture.Resize();   //Note: Resize will reset client anchor you set.
picture.LineStyle = LineStyle.DashDotGel;
public static int LoadImage(string path, IWorkbook wb)
{
	FileStream file = new FileStream(path, FileMode.Open, FileAccess.Read);
	byte[] buffer = new byte[file.Length];
	file.Read(buffer, 0, (int)file.Length);
	return wb.AddPicture(buffer, PictureType.JPEG);

}

//调整列宽和行高
//set the width of columns
sheet1.SetColumnWidth(0, 50 * 256);
//set the width of height
sheet1.CreateRow(0).Height = 100 * 20;

//冻结窗格
 // Freeze just one row
sheet1.CreateFreezePane(0, 1, 0, 1);
// Freeze just one column
sheet2.CreateFreezePane(1, 0, 1, 0);
// Freeze the columns and rows (forget about scrolling position of the lower right quadrant).
sheet3.CreateFreezePane(2, 2);
// Create a split with the lower left side being the active quadrant
sheet4.CreateSplitPane(2000, 2000, 0, 0, PanePosition.LowerLeft);


//定义公式
//set A4=A2+A3
s1.CreateRow(3).CreateCell(0).CellFormula = "A2+A3";
//set cross-sheet reference
s2.CreateRow(0).CreateCell(0).CellFormula = "Sheet1!A2+Sheet1!A3";

//自动收缩列
ICellStyle cellstyle1 = hssfworkbook.CreateCellStyle();
cellstyle1.ShrinkToFit = true;
cell1.CellStyle = cellstyle1;

//显示单元格的线
ISheet s2 = hssfworkbook.CreateSheet("Sheet2");
s2.DisplayGridlines = true;

//设置单元格内容对齐方式
row.CreateCell(0).SetCellValue("Left");
ICellStyle styleLeft=hssfworkbook.CreateCellStyle();
styleLeft.Alignment = HorizontalAlignment.Left;
styleLeft.VerticalAlignment = VerticalAlignment.Top;
row.GetCell(0).CellStyle = styleLeft;
//为单元格中的文本设置缩进
styleLeft.Indention = 3;

//改变工作表标签颜色
ISheet sheet1=hssfworkbook.CreateSheet("Sheet1");
sheet1.TabColorIndex = HSSFColor.Red.Index;

/// <summary>
/// 复制工作表
/// </summary>
void CopySheet()
{            
	OpenFileDialog ofd = new OpenFileDialog();
	ofd.Filter = "Excel document (*.xlsx)|*.xlsx";
	ofd.Title = "Select first Excel document";
	if (ofd.ShowDialog() == DialogResult.OK)
	{
		XSSFWorkbook book1 = new XSSFWorkbook(new FileStream(ofd.FileName, FileMode.Open));
		ofd.Title = "Select second Excel document";
		if (ofd.ShowDialog() == DialogResult.OK)
		{
			XSSFWorkbook book2 = new XSSFWorkbook(new FileStream(ofd.FileName, FileMode.Open));
			XSSFWorkbook product = new XSSFWorkbook();

			for (int i = 0; i < book1.NumberOfSheets; i++)
			{
				XSSFSheet sheet1 = book1.GetSheetAt(i) as XSSFSheet;
				sheet1.CopyTo(product, sheet1.SheetName, true, true);
			}
			for (int j = 0; j < book2.NumberOfSheets; j++)
			{
				XSSFSheet sheet2 = book2.GetSheetAt(j) as XSSFSheet;
				sheet2.CopyTo(product, sheet2.SheetName, true, true);
			}
			product.Write(new FileStream("test111111111111.xlsx", FileMode.Create, FileAccess.ReadWrite));
		}

	}
}

/// <summary>
/// 创建大表格
/// </summary>
void BigGridTest()
{
	IWorkbook workbook = new XSSFWorkbook();
	ISheet worksheet = workbook.CreateSheet("Sheet1");

	for (int rownum = 0; rownum < 10000; rownum++)
	{
		IRow row = worksheet.CreateRow(rownum);
		for (int celnum = 0; celnum < 20; celnum++)
		{
			ICell Cell = row.CreateCell(celnum);
			Cell.SetCellValue("Cell: Row-" + rownum + ";CellNo:" + celnum);
		}
	}

	FileStream sw = File.Create("testBigGridTest.xlsx");
	workbook.Write(sw);
	sw.Close();
}

/// <summary>
/// 合并单元格
/// </summary>
void MeringCellsInXlsx()
{
	IWorkbook workbook = new XSSFWorkbook();
	ISheet sheet = workbook.CreateSheet("PictureSheet");

	IRow row = sheet.CreateRow(1);
	ICell cell = row.CreateCell(1);
	cell.SetCellValue(new XSSFRichTextString("This is a test of merging"));

	sheet.AddMergedRegion(new CellRangeAddress(1, 1, 1, 2));

	FileStream sw = File.OpenWrite("testMeringCellsInXlsx.xlsx");
	workbook.Write(sw);
	sw.Close();
}

/// <summary>
/// 大文件写入性能测试
/// </summary>
IWorkbook workbook = new XSSFWorkbook();
ISheet sheet1 = workbook.CreateSheet("Sheet1");
sheet1.CreateRow(0).CreateCell(0).SetCellValue("This is a Sample");
int x = 1;

Console.WriteLine("Start at " + DateTime.Now.ToString());
for (int i = 1; i <= 70000; i++)
{
	IRow row = sheet1.CreateRow(i);
	for (int j = 0; j < 15; j++)
	{
		row.CreateCell(j).SetCellValue(x++);
	}
}
Console.WriteLine("End at " + DateTime.Now.ToString());

FileStream sw = File.Create("testWritePerformanceTest.xlsx");
workbook.Write(sw);
sw.Close();

Console.Read();
```

