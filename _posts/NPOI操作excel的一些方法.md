---
layout: post
title: "[转载]Unity 数据读写与存档（1）——配置表初探"
subtitle: "网上看到自己可能用得到的知识文章转载保存，防止时间长了网站没了或者被傻卵中国互联网产品经理以各种缺德的方式想办法让你去用他们的傻卵APP看文章。"
date: 2020-06-19 20:39:12
author: "晴窗v"
header-img: "img/post-bg-css.jpg"
tags:
- Unity
- C#
---
# [转载]Unity 数据读写与存档（1）——配置表初探

原文地址：https://blog.csdn.net/qq_35587645/article/details/106859624

## **1.1 与策划小伙伴协同工作**

如果大家在使用Unity的游戏公司工作，或者对游戏公司的工作流程与技术有所知晓，相信一定会或多或少地听说过“配置表”这个东西。

**什么是配置表呢？**很简单，**配置表**就是一些普通的Excel表格，即**.xlsx**文件；而使用**配置表**，则是一种在游戏的团队开发过程中十分常见的工作方式。

**配置表是做什么用的？**一般来说，配置表与游戏中的人物属性、道具属性等数值设定密切相关。

> **例如，游戏中有100名不同的角色，每个角色都拥有各自的名字、生命值、攻击力和移动速度，不同角色的以上数据各不相同。在游戏的开发和更新过程中，策划人员可能经常需要修改这些数据。**

对于团队合作的开发过程而言，怎样让策划人员记录和修改这些数据呢？很明显，在代码内或Unity编辑器内进行编辑是不合适的。理由如下：

> （1）首先，C#代码和Unity编辑器并非为数据管理所设计。对于【100个不同角色的属性】这样的大批量数据，如果在代码内或Unity界面上进行管理，那么管理的效率恐怕和手动在txt文件内编辑文本没有什么区别；
>
> （2）其次，游戏的代码在同一时刻只能有一个正确版本。一旦策划部门开始编辑数据，那么程序部门必须停止工作，等待策划人员将代码修改完毕并传回，才能继续写新的代码，这会使协同工作毫无效率可言；
>
> （3）此外，游戏的策划人员不一定是计算机类专业出身，可能难以熟练地编辑代码或操作Unity编辑器。

因此，我们必须找到办法，在项目中使用Excel表格来管理**大批量、有规律且经常需要编辑的数据**；同时，必须为Excel文件在Unity中寻求合适的读、写方式，来使程序部门能够快速读取并应用来自策划部门的数值设定，从而实现开发过程中的良好协同性。

## 1.2 初识配置表

说了这么多，配置表到底长什么样子呢？我们直接根据情境，来看一个简单而典型的配置表！

> **假设游戏中需要定义若干个人物(Unit)的属性。每个人物具有以下属性：ID、名称、生命上限、攻击力和移动速度。现在我们打开Excel或WPS软件，新建一个.xlsx文件，来定义两个游戏人物：汤姆和杰瑞。**

![image-20240217160819870](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/image-20240217160819870.png)

习惯上，我们使用的配置表，在格式和内容含义上满足以下性质：

> - **表格中的第一行是表头。表头的每一格是一个字段，该字段规定了配置个体需要被定义的一项属性；**
> - **从第二行开始，每一行代表一个配置个体。依据表头，每一行都标明了一名个体属性的具体值；**
> - **第一列是个体的ID。每个配置个体必须被赋予一个独一无二的ID，这是我们对表内个体进行查、删、改的依据。**
> - ***各个配置个体是没有顺序的。每个个体所在的行号可以任意变动，而不影响配置表的效力；每个配置个体的ID数值可以是任意值，不需要有任何规律性，也不需要在数值上连续。**
> * **这对于大型项目的工作效率有着至关重要的意义。例如在拥有数万种道具的大型游戏中，如果策划想要再新增一种道具，只需要在配置表末尾另起一个ID即可，并不需要在数万行的表格内部寻找一个适合的位置和ID数值来插入该道具；想要删除一个道具时，直接删除个体所在行即可，其余道具不需要修改ID来填补空位。*

将前面创建的配置表命名为**Unit.xlsx**，下面我们将学习在Unity中读取它。

## **1.3 读取Excel文件**

*【本小节知识主要出自《Unity3D游戏开发——第2版》，人民邮电出版社，作者：宣雨松（博客：雨松MOMO）】*

作者官网：[https://www.xuanyusong.com/](http://www.baidu.com/link?url=sut0qBbGfjmN9p2DYAL-kccbA_KvohZ74EYHJzu5GI3tZplu_tBhmKRviK_I6kGW)

建立一个新Unity项目，将**Unit.xlsx**文件导入Unity，会发现无法对其进行任何操作；因为，Unity并不直接支持***\*.xlsx\****这种资源格式，不能直接读取配置表。C#所依赖的.NET FrameWork也没有自带对Excel文件的访问功能，因此我们引入一个GitHub上的第三方dll库: **EPPlus.dll**。在网上搜索，该文件随处都可以下载到。

Unity可以非常好地支持第三方dll文件。将文件**EPPlus.dll**直接拖入到Unity资源的任意路径，它会显示为一个拼图形状的图标，代表插件类资源。选中它，将该插件的使用平台设定为Editor（编辑器），这个插件就设置完成啦。

设置完成后的**EPPlus.dll**在Unity中显示如下图。

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/d72496847cac04793171f53e319a0ddc.png)

**在Unity项目的Assets目录下建立名为Excel的文件夹，将前面创建的*Unit.xlsx*文件放入其中。创建游戏脚本*ReadUnits.cs*，代码内容如下。**

```c#
using UnityEngine;
using UnityEditor;
using System.IO;
using OfficeOpenXml;//启用EPPlus插件
 
public class ReadUnits : MonoBehaviour
{
    [MenuItem("Excel/Read Excel")]//添加Unity编辑器菜单项用来读表
    static void LoadExcel()
    {
        string path = Application.dataPath + "/Excel/Unit.xlsx";//指定待读取表格的文件路径。在编辑器模式下，Application.dataPath就是Assets文件夹
 
        FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);//建立文件流fs
 
        ExcelPackage excel = new ExcelPackage(fs);//这是来自第三方插件的功能，将文件流fs视为Excel文件，开始访问
 
        ExcelWorksheets workSheets = excel.Workbook.Worksheets;//查找到工作簿内的各工作表
 
        ExcelWorksheet workSheet = workSheets[1];//只看第一个工作表，余者不看
 
        int colCount = workSheet.Dimension.End.Column;//工作表的列数
        int rowCount = workSheet.Dimension.End.Row;//工作表的行数
 
        for (int row = 1; row <= rowCount; row++)//从当前工作表的第一行遍历到最后一行
        { 
            for (int col = 1; col <= colCount; col++)//从第一列遍历到最后一列
            {
                string text = workSheet.Cells[row, col].Text;//读取每个单元格中的数据
                Debug.LogFormat("表格坐标:({0},{1}),表格内容:{2}", row, col, text);
            }
        }
 
        Debug.Log("complete");
        return;
    }
}
```

本段代码调用UnityEditor功能，在Unity编辑器上提供自定义的选项卡和选项**Excel/Read Excel**。选中一次该选项，即可调用LoadExcel方法执行读表操作。

编译完成后，可以看到Unity编辑器的顶部出现了新的选项卡”Excel”。

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/57540f01026c5a94fa10a73810c354e2.png)

现在，选中该选项卡内的Read Excel选项，执行代码内的LoadExcel()静态方法，进行读表。

查看Console页面，我们看到，**Unit.xlsx**文件已经被成功解读，Console页面中显示出了表格中每一格的坐标和文字内容。

![img](file:///d:\Users\qccwi\Documents\Tencent Files\1012803704\nt_qq\nt_data\Pic\2024-02\Ori\aeff37304722a4057842ee2daf85b2de.png)
![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/d6bff95631a97b2eb3430bdf88a4e89e.png)

到这里，我们就在Unity中首次完成了对Excel表格的读取，是不是很开心？

##  1.4 处理Excel数据的思路

实现了对Excel的读取很让人兴奋，但在功能上还颇为欠缺；我们前面仅仅是将Excel表格中的文字内容输出到了页面上——这就好像编程中的Hello World，离实现有用的功能还相距甚远。

那么，对于配置表的读取，我们希望在功能上达到什么样的效果呢？

> **假设在项目中有若干个游戏物体obj，它们每一个都代表着一名游戏角色，但它们的具体属性处于待定状态。**
>
> **现在我们希望，当策划人员在配置表中写入对游戏内各角色的属性设定后，我们通过为每个obj指定配置表中的对应ID，就能在Unity中实现对该角色属性的自动设置——将这个待定角色的各项角色属性，设定成配置表中对应ID所记载的属性值。这样一来，我们就能形成顺畅的工作流程，从而便捷地将策划人员在配置表中敲定的属性数值、名称文案等内容快速应用到游戏角色上。**
>
> **而从策划部门的体验而言，只需要向程序人员提交更新过的配置表，即可实现对游戏内数值、文案等内容的自主修正，而无需程序人员提供任何技术上的帮助。这无疑能大大提高策划的工作效率。**

于是，现在我们需要编写代码，来尝试将我们从Excel文档中读取的数据应用到Unity编辑器中。

新建一个脚本文件**UnitInfo.cs**，该组件用于挂载到游戏角色上，代表着游戏内角色的属性。假想我们的项目中管理着很多角色——数量多到我们不愿意手动填写UnitInfo组件中记载的角色各项属性。

**UnitInfo.cs**代码内容如下:

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
 
[Serializable]
public class UnitSettings
{
    public int ID;
    public string Name;
    public int HitPointLimit;
    public int Damage;
    public int MoveSpeed;
}
 
public class UnitInfo : MonoBehaviour
{
    public UnitSettings Settings;
}
```

在游戏中*随意建立几个空物体（或者方块、圆球、胶囊体......），将UnitInfo组件挂载上去。容易看出，UnitInfo是一个游戏角色数据的记录器，其上的各项数据处于未设定状态。

**这些空物体用来代表游戏中的各个游戏角色。由于本篇目讲解的是Excel读表，所以我们不需要让游戏角色具有模型、动画等游戏性元素，只要能挂上组件就可以了。*

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/666708dcdbf5c2e0971ce62d210b3923.png)

我们应该怎样做，才能从Excel表格中读出数据，然后应用到UnitInfo组件上呢？

现在，问题就变成了一个编程思路问题。在上一节中，我们已经知道如何获取表格内各个格子的内容；我们要想将这些内容应用到游戏角色上，应当以什么为操作对象呢？

> **容易想到，如果Unit表变得很长，例如有200行；每一行代表一份角色数据，那么此时这个表记载了199份不同的游戏角色数据。将每一份数据想象成一个球，那么199份数据放在一起就好像一个海洋球泳池——需要取出一份数据应用到特定游戏角色时，只要捞出一个特定ID的球即可。**

![image-20240217161758468](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/image-20240217161758468.png)

**于是我们知道，读取配表的过程最好以“小球”为操作对象，也就是说，应当以Excel表的“行”为操作单元。每一行代表一组数据，这组数据可以定义一个游戏角色的属性。**

## 1.5  将表格拆分为基础单元

创建脚本文件**BaseExcel.cs**, 作为后续功能的基础支持模块，用来定义和描述Excel表中以行为单位的基础单元。这段代码非常简短，仅仅定义了一个**IndividualData**类，用来描述Excel表格中的一行数据。*IndividualData类在创建时会根据配置表的列数，来决定存储数据字段的数组长度；例如配置表有5列，则数组也应能存储5个字段。*

*Tips-1：从这里开始，我们有关配表读取的脚本都将使用或引用**XlsWork**命名空间，从而实现协同工作。*

**BaseExcel.cs**内容如下：

```c#
using System;
 
namespace XlsWork
{
    public class IndividualData
    {
        public string[] Values;
        public IndividualData(int Columns)
        {
            Values = new string[Columns];
        }
    }
}
```

然后，编写读取配置表的核心模块。新建一个脚本文件**UnitXls.cs**。

> 根据先前的思路，不难猜出此模块的功能——**将Excel配表文件按行拆成一个个“小球”，然后将拆散之后的各行数据输出为一个海洋球池。**在本模块中，这个海洋球池是一个以首列的ID为键，单行全部数据为值的C#字典；这就好像给每个小球贴上了各自的ID作为标签。字典生成后，我们只要向字典输入ID，即可查询到具有对应ID的小球，也就是该ID对应的那份游戏角色数据。

**UnitXls.cs**内容如下：

```c#
using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine;
using System.IO;
using OfficeOpenXml;
 
namespace XlsWork
{
    namespace UnitsXls
    {
        public class UnitXls : MonoBehaviour
        {
            /// <summary>
            /// 配表中属性字段的数量
            /// </summary>
            public static int CountOfAttributes = 5;
 
            public static Dictionary<int, IndividualData> LoadExcelAsDictionary()
            {
                Dictionary<int, IndividualData> ItemDictionary = new Dictionary<int, IndividualData>();//新建字典，用于存储以行为单位的各个操作单元
 
                string path = Application.dataPath + "/Excel/Unit.xlsx";//指定表格的文件路径。在编辑器模式下，Application.dataPath就是Assets文件夹
 
                FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);//建立文件流fs
 
                ExcelPackage excel = new ExcelPackage(fs);
 
                ExcelWorksheets workSheets = excel.Workbook.Worksheets;//获取全部工作表
 
                ExcelWorksheet workSheet = workSheets[1];//只看第一个工作表，余者不看
 
                int colCount = workSheet.Dimension.End.Column;//工作表的列数
                int rowCount = workSheet.Dimension.End.Row;//工作表的行数
 
                for (int row = 2; row <= rowCount; row++)//从当前工作表的第二行遍历到最后一行(第一行是表头，所以不读取)
                {
                    IndividualData item = new IndividualData(CountOfAttributes);//新建一个操作单元，开始接收本行数据
 
                    for (int col = 1; col <= colCount; col++)//从第一列遍历到最后一列
                    {
                        //读取每个单元格中的数据
                        item.Values[col - 1] = workSheet.Cells[row, col].Text;//将单元格中的数据写入操作单元
                    }
 
                    int itemID = Convert.ToInt32(item.Values[0].ToString());//获取操作单元的ID
 
                    ItemDictionary.Add(itemID, item);//将ID和操作单元写入字典
                }
 
                Debug.Log("complete");
                return ItemDictionary;
            }
        }
    }
}
```

## 1.6 查找并应用数据单元

很明显，我们已经向最终的效果前进了一大步。通过上一节内容，我们成功地编写了LoadExcelAsDictionary()方法，该方法能够将Excel文档逐行拆散，并将各行数据重组为易于在C#中操作的字典。但是，这项功能还未能与单个的游戏角色建立联系，因此还不能将读出的数据应用到单个的UnitInfo组件上。现在，我们需要为UnitInfo加入一些新功能，让每个UnitInfo组件从配置表中读取指定ID的数据单元，并将数据应用到自身。

修改UnitInfo组件，引入XlsWork和XlsWork.UnitXls（在UnitXls.cs中定义）命名空间并补充功能。

修改后的**UnitInfo.cs**如下：

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using XlsWork;
using XlsWork.UnitsXls;
 
 
[Serializable]
public class UnitSettings
{
    public int ID;
    public string Name;
    public int HitPointLimit;
    public int Damage;
    public int MoveSpeed;
}
 
public class UnitInfo : MonoBehaviour
{
    public UnitSettings Settings;
 
    [Header("配表内ID")]
    public int InitFromID;
 
 
    public void InitSelf()
    {
        Action init;
 
        var dictionary = UnitXls.LoadExcelAsDictionary();//调用读表方法并获取生成的字典
 
        //如果字典中没有查到所需的ID，说明表内没有相应ID的数据，报出异常
        if (!dictionary.ContainsKey(InitFromID))
        {
            Debug.LogErrorFormat("未能在配表中找到指定的ID:{0}", InitFromID);
            return;
        }
        IndividualData item = dictionary[InitFromID];//如果字典中查到了所需的数据，则将该操作单元记录下来
 
 
        //将操作单元内的数据应用到自身
        //System.Convert在这里用于实现表格内文本对代码内数据类型的自适应，将Excel单元格中的字符串转换成int或其它类型
        init = (() =>
        {
            Settings.ID = Convert.ToInt32(item.Values[0]);
            Settings.Name = Convert.ToString(item.Values[1]);
            Settings.HitPointLimit = Convert.ToInt32(item.Values[2]);
            Settings.Damage = Convert.ToInt32(item.Values[3]);
            Settings.MoveSpeed = Convert.ToInt32(item.Values[4]);
        });
 
        init();
    }
}
```

修改之后的UnitInfo组件在Inspector中的外观如图。InitFromID属性要求你填入一个ID——依据这个ID，UnitInfo中新加入的InitSelf方法就可以呼叫**UnitXls.**LoadExcelAsDictionary()方法来读表，然后获取返回的字典，并将指定ID的行数据应用到自身。

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/5674d96d22ee86c7068bd7969ab79226.png)

#### 1.7  Inspector自定义按钮

到这里，准备工作已经万事大吉，只差最后一步——**我们要再次利用UnityEditor提供的自定义编辑器功能，为单个角色的UnitInfo组件赋予一个自定义的Inspector按钮。**这样我们就可以对每个UnitInfo组件下达最终的指令，执行读表操作。

创建脚本**UnitInfo_Editor.cs**。代码如下：

```C#
using UnityEngine;
using UnityEditor;
 
[CustomEditor(typeof(UnitInfo))]//将本模块指定为UnitInfo组件的编辑器自定义模块
public class UnitXls_Editor : Editor
{
    public override void OnInspectorGUI()//对UnitInfo在Inspector中的绘制方式进行接管
    {
        DrawDefaultInspector();//绘制常规内容
 
        if(GUILayout.Button("从配表ID刷新"))//添加按钮和功能——当组件上的按钮被按下时
        {
            UnitInfo unitInfo = (UnitInfo)target;
            unitInfo.InitSelf();//令组件调用自身的InitSelf方法
        }
    }
}
```

此脚本可以理解为**UnitInfo.cs**的附属挂件；它的作用是改变UnitInfo组件在Inspector中的显示内容，为该组件在Inspector上添加一个按钮。在编辑模式下单击按钮，即可调用InitSelf方法，执行读表的全过程。

编译代码，返回Unity编辑器，可以看到UnitInfo组件的外观发生了变化：

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/b9eb63ef695c3c75bfae514aa360ecf2.png)

组件上多出了一个自定义按钮！

现在，我们只要在InitFromID中填写为表格内已有的ID，按下按钮，就可以对UnitInfo的属性进行设置。

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/3c245777c8674fd4df14fae8fda03eb1.png)

根据表格的内容，我们填入**1**试一下。按下按钮，UnitInfo组件的属性数值，立即变成了表格内记载的角色“汤姆”的数值：

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/cabee567816b3217c7fc78882de5b7e2.png)

将Init From ID从**1**改为**0**，以获取“杰瑞”的数据。再点击按钮刷新一次，结果如下：

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/e6449285c28f3c46d18db131a641f095.png)

至此，我们的任务终于大功告成！在艰苦的努力下，Excel文件终于在Unity中摘下了高冷难及的面纱；现在，我们可以使用配置表来管理游戏中的批量数据，为开发中的重复性工作和团队协作提供一种强力的保障。

## *1.8 架构优化与扩展（可选内容）

*拥有较强编程实力，或有大型项目开发经验的小伙伴们请往下看。*

**1.8.1 消除耦合**

**在这个时候，我们最好重写一下UnitInfo.cs和UnitInfo_Editor.cs，将InitSelf方法从UnitInfo.cs转移到UnitInfo_Editor.cs中。转移之后，UnitInfo.cs不需要再引入Excel相关命名空间，在完全脱离Excel相关模块的情况下也能单独运作，从而极大地降低模块之间的耦合度。Excel读配表与游戏的运行模式完全无关，因此我们在项目的发布阶段，可能需要把整个Excel读表模块移除掉。所以，最好不要让游戏的主要逻辑与读表部分产生依赖性。**

优化之后的代码如下：

**（1）UnitInfo_Editor.cs（优化版）**

```C#
using UnityEngine;
using UnityEditor;
using System;
using XlsWork;
using XlsWork.UnitsXls;
 
[CustomEditor(typeof(UnitInfo))]//将本模块指定为UnitInfo组件的编辑器自定义模块
public class UnitInfo_Editor : Editor
{
    public override void OnInspectorGUI()//对UnitInfo在Inspector中的绘制方式进行接管
    {
        DrawDefaultInspector();//绘制常规内容
 
        if(GUILayout.Button("从配表ID刷新"))//添加按钮和功能——当组件上的按钮被按下时
        {
            UnitInfo unitInfo = (UnitInfo)target;
            Init(unitInfo);
        }
    }
 
    public void Init(UnitInfo instance)
    {
        Action init;
 
        var dictionary = UnitXls.LoadExcelAsDictionary();
 
        if (!dictionary.ContainsKey(instance.InitFromID))
        {
            Debug.LogErrorFormat("未能在配表中找到指定的ID:{0}", instance.InitFromID);
            return;
        }
        IndividualData item = dictionary[instance.InitFromID];
 
        init = (() =>
        {
            instance.Settings.ID = Convert.ToInt32(item.Values[0]);
            instance.Settings.Name = Convert.ToString(item.Values[1]);
            instance.Settings.HitPointLimit = Convert.ToInt32(item.Values[2]);
            instance.Settings.Damage = Convert.ToInt32(item.Values[3]);
            instance.Settings.MoveSpeed = Convert.ToInt32(item.Values[4]);
        });
 
        init();
    }
}
```

**（2）UnitInfo.cs只需要退回最初的版本即可。**

```C#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
 
[Serializable]
public class UnitSettings
{
    public int ID;
    public string Name;
    public int HitPointLimit;
    public int Damage;
    public int MoveSpeed;
}
 
 
 
public class UnitInfo : MonoBehaviour
{
    public UnitSettings Settings;
    [Header("配表内ID")]
    public int InitFromID;
}
```

优化之后，我们已经将与Excel有关的配置表相关代码与游戏的主逻辑部分完全剥离开。此时，不妨将读表相关模块在项目中统一放到单独的文件夹内，作为一个“大插件”进行管理。

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/7f97a2d00e0fbe284c28f88ebc943a30.png)

不需要读配表时，将黄色框内的内容整体删除，不会引发任何故障。

**1.8.2 模块可扩展性**

在项目中，可能有不止一个地方需要读取配置表；除了前面展示的角色属性管理，还可能在道具、商店等更多地方用到配置表。

如果你很细心，或许已经发现，前面的UnitXls模块被做成了Excel主模块（即XlsWork）命名空间的一个分支。如果我们需要引入新的配置表读取系统，只需要将1.8.1图中Unit文件夹内的模块另起一份，引入另一个分支命名空间XlsWork.xxx，然后写入新的读表逻辑即可。

例如，如果你想要加入一个道具表（Item）系统，那么你的架构应该是这样：

![img](img/inpost/%E6%9C%AA%E5%91%BD%E5%90%8D/7cbf2bc47e51927dca6ae6338eb2b490.png)

黄色框内是配置表系统，蓝色框内是游戏的主逻辑。在此架构下，你可以扩展出任意多个配置表分支，且配置表系统始终不会与游戏主干代码产生相互依赖。