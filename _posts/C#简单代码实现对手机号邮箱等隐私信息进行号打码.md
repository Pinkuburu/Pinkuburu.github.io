C#简单代码实现对手机号邮箱等隐私信息进行*号打码

一个系统的安全设计总是会注重用户的隐私保护的，开发中也不乏能遇到这样的需求，将电话号码，QQ号，邮箱之类的敏感信息进行脱敏处理，呈现基本信息的同时并保护用户隐私。比如13123456789这样的手机号，通常展示为131****6789。

当然，如果只是手机号这种固定位数的实现起来也算是相当简单的，但QQ号、微信号这种长度不固定的，我们需要做一个通用的脱敏处理。

比如：

1@masuit.com这种用户名只有1位的邮箱，想要脱敏，应该是1****@masuit.com吧；

ldqk脱敏后应该是l****；

1234567脱敏后应该是1****67；

所以，我们应该针对不同的位数做处理，简单分析得出以下几种不同的情况：

只有1-5位的时候，补全到5位；

6-10位，替换中间4位；

11位以上，缩减到11位并替换中间4位；

替换我们可以直接使用正则表达式进行替换脱敏，我们先实现11位手机号的脱敏：

```c#
Regex.Replace(s, @"(.{3}).*(.{4})", "$1****$2")
```

但有时候我们想使用?进行脱敏，所以打码字符应该通过参数的方式进行传递，故我们需要从外部传递脱敏符号，并根据不同情况，作相应的正则替换，封装代码如下：

```c#
        /// <summary>
        /// 字符串掩码
        /// </summary>
        /// <param name="s">字符串</param>
        /// <param name="mask">掩码符</param>
        /// <returns></returns>
        public static string Mask(this string s, char mask = '*')
        {
            if (string.IsNullOrWhiteSpace(s?.Trim()))
            {
                return s;
            }
            s = s.Trim();
            string masks = mask.ToString().PadLeft(4, mask);
            return s.Length switch
            {
                >= 11 => Regex.Replace(s, "(.{3}).*(.{4})", $"$1{masks}$2"),
                10 => Regex.Replace(s, "(.{3}).*(.{3})", $"$1{masks}$2"),
                9 => Regex.Replace(s, "(.{2}).*(.{3})", $"$1{masks}$2"),
                8 => Regex.Replace(s, "(.{2}).*(.{2})", $"$1{masks}$2"),
                7 => Regex.Replace(s, "(.{1}).*(.{2})", $"$1{masks}$2"),
                6 => Regex.Replace(s, "(.{1}).*(.{1})", $"$1{masks}$2"),
                _ => Regex.Replace(s, "(.{1}).*", $"$1{masks}")
            };
        }
```

原文地址：https://ldqk.xyz/1790