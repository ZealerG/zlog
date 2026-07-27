---
title: Java复习
date: 2026-05-07 15:08
description:
draft: true
categories: 笔记
tags:
  - 学习
  - 笔记
---
# Java 基础
## 面向对象
### 怎么理解面向对象？简单说说其三大特性
面向对象是一种编程范式，它**将现实世界中的事物抽象成对象**，对象具有属性（字段或属性）和行为（方法）。面向对象编程的设计思想是以对象为中心，通过对象之间的交互来完成程序的功能，通过封装和继承可以更好地应对需求变化
Java 面向对象三大特性为：**封装、继承、多态**：
- **封装：** 封装是指将对象的属性（字段或数据）和行为（方法）结合在一起，对外隐藏对象的内部细节，仅通过对象提供的接口与外界交互。封装的目的是增强安全性和简化编程，使得对象更加独立
- **继承：** 继承是一种可以使子类自动共享父类数据结构和方法的机制。它是代码复用的重要手段，通过继承可以建立类与类之间的**层次**关系，使结构更加清晰
- **多态：** 多态是指允许不同类对象对同一消息做出响应。即同一接口，使用不同实例而执行不同操作。多态性又可分为 **编译时多态（重载）** 和 **运行时多态（重写）**
### 多态有几种体现方式？
1. **方法重载：**
	- 方法重载指的是同一个类可以有多个**同名**方法，它们具有**不同**的参数列表（参数类型、数量或者顺序不同）。虽然方法名相同，但根据传入参数的不同，编辑器会在编译时确定调用哪个方法
	- 示例：对于一个 `add` 方法，可以定义为 `add(int a, int b)` 和 `add(double a, double b)`
2. **方法重写：**
	- 方法重写指的是子类能够提供对父类中同名方法的具体实现。在**运行时**，JVM 会根据对象的实际类型确定调用哪个版本的方法，这也是多态的主要方式
	- 示例：在一个动物类中，定义一个 `sound` 方法，子类 `Dog` 和 `Cat` 可以重写该方法已实现不同的叫声
3. **接口与实现：**
	- 多态也体现在接口的使用上，多个类可以实现同一个接口，并且用接口类型的引用来调用这些类的方法（父类型引用指向子类对象）。这使得程序在面对不同具体实现时保持一贯的调用方式，但在运行时会根据实际对象类型执行对应实现类的方法（运行时多态）
	- 示例：多个类（如 `Dog`, `Cat`）都实现了一个 `Animal` 接口，当用 `Animal` 类型的引用来调用 `makeSound` 方法时，会触发对应的实现

``` java fold
Animal animal = new Dog();
animal.makeSound(); // 实际调用 Dog 的 makeSound()

Animal animal2 = new Cat();
animal2.makeSound(); // 实际调用 Cat 的 makeSound()
```

4. **向上转型和向下转型：**
	- 在 Java 中可以使用父类类型的引用指向子类对象，即向上转型。通过这种方式可以在运行时采用不同的子类实现
	- 向下转型是将父类引用转回其子类类型，但在执行前需要确认引用实际指向的对象类型以避免 `ClassCastException`
### 抽象类和接口的区别是什么？
> 抽象类强调类“是什么”
> 接口类强调类“能做什么”

**两者的特点：** 
- 抽象类用于描述类的**共同属性和公共行为**（吃），可以有成员变量、构造方法和具体方法。适用于有明显继承关系的场景
- 接口用于定义**行为规范**（动物叫声），可以多实现，**只能有常量和抽象方法**（Java 8 以后可以有默认方法和静态方法）。适用于定义类的能力或功能
**两者的区别：**
- 实现方式：实现接口关键字为 `implements`，继承抽象类关键字为 `extends` 。一个类可以实现多个接口，但一个类只能继承一个抽象类。所以使用接口可以间接实现多重继承
- 方法方式：接口只能定义，不能有方法的实现，Java 8 中可以定义 default、static 方法体，而抽象类可以有定义与实现，方法可在抽象类中实现
- 访问修饰符：接口成员变量默认为 `public static final`，且必须赋初值，不能被修改；接口中的抽象方法默认是 `public abstract`
- 变量：抽象类可以包含实例变量和静态变量，而接口只能包含常量（静态常量）
> 在实际开发中，如果多个类属于同一类事物，并且有**公共状态**和**公共逻辑**，我会考虑抽象类；如果只是定义某种**能力**或**规范**，希望**不同类都能实现**，我会优先使用接口

### 重载和重写的区别
> 重载是指在同一个类中定义多个同名方法，而重写是指子类重新定义父类中的方法
- **重载（Overloading）** 指的是在同一个类中有多个同名方法，它们有不同的参数列表（参数类型、参数个数或参数顺序不同），编译器根据调用时的参数类型来决定调用哪个方法
- **重写（Overriding）** 指的是子类可以重新定义父类的方法，且方法名、参数列表和返回类型必须与父类一致，通过 `@Override` 注解来明确表示这是对父类方法的重写
## 概念
### 值传递和引用传递
在 Java 中，参数传递只有 **值传递** 一种，不存在真正的“引用传递”，其核心区别在于传递的是“值的副本”还是“引用的副本”
**值传递（Pass by Value）** 传递的是实际值的副本，适用于 **基本数据类型** ，修改方法内的参数副本，**不会影响原变量的值**

```java
public static void main(String[] args){
	int num = 10;
	changeValue(num);
	System.out.println(num);//输出10（原变量未被修改）
}
public static void changeValue(int a){
	a = 20;//修改的是副本
}
```

**引用传递的误解（本质上是值传递）。对于对象（也就是引用类型）**，传递的是 **对象引用的副本**（而不是对象本身）
两个引用（原引用和副本）指向 **同一个对象**，通过副本修改对象内部数据，**会影响原对象**，但如果修改副本的指向（如重新赋值），**不会影响原引用的指向**

```java
public class Person {
	String name;
	Person(String name) { this.name = name;}
}

public static void main(String[] args) {
	Person p = new Person("Alice");
	changeName(p);
	System.out.println(p.name);//输出"Bob"，对象内部被修改
	
	changeReference(p);
	System.out.println(num);//输出"Bob"，原引用指向未变
}

//修改对象内部数据
public static void changeName(Person obj) {
	obj.name = "Bob";//副本和原引用指向的是同一个对象
}

//修改副本指向（不影响原引用）
public static void changeReference(Person obj) {
	obj = new Person("Charlie");//副本指向新对象，原引用依旧指向旧对象
}
```

Java 中 **所有参数传递都是值传递**
- 基本数据类型传递“值的副本”，修改副本不影响原值
- 引用类型传递“引用的副本”，通过副本可修改对象内容，但无法改变原引用的指向

### 逻辑与 (&) 和短路与 (&&)
逻辑与和短路与差别很大，虽然二者都要求运算符左右端的布尔值为 true，整个表达式的值才为 true
但 `&&` 之所以称为 **短路**与，原因在于如果 `&&` 左边表达式是 false，右边表达式会直接 **短路** 掉不会再做运算
同时：逻辑或(|)和短路或(||)也是同理
## 数据类型
> 分为基本数据类型和引用数据类型
> 基本数据类型为 8 种
> - 数值型：整数类型（byte、short、int、long）和浮点类型（float、double）
> - 字符型：char
> - 布尔型：boolean
### 为什么要有包装类？
Java 有 8 种基本类型，但基本类型不是对象，不能直接参与面向对象体系，所以就提供了对应的包装类，包装类的本质是把基本类型“对象化”，让其具备对象能力
- 包装类就是把基本数据类型包装成 Object 对象，对象封装之后就可以把属性也就是数据跟处理这些数据的方法结合在一起，比如 Integer 就有 parseInt() 等方法来专门处理 int 型相关的数据
- 另一个非常重要的原因就是在 Java 中绝大部分方法或类都是用来处理类类型对象的，比如 ArrayList 集合类就只能以类作为其存储对象，如果要把一个 int 型数据存入 list 是不可能的，必须把它包装成类，也就是 Integer 才能被 List 所接受
- 泛型，在 Java 中泛型只能使用引用类型，不能使用基本类型
- 转换，基本类型和引用类型不能直接进行转换，必须用包装类来实现，例如将一个 int 类型转换为 String 类型，需要先将其转换为 Integer 类型
- 支持 null，表达没有值，像 `int age = 0` 想表达的是“年龄为 0”还是“没有填写年龄”？表达不清楚，而包装类就可以是 `Integer age = null` 
### 自动装箱和自动拆箱是什么？
> 自动装箱是基本类型自动转成包装类；自动拆箱是包装类自动转成基本类型

**1. 自动装箱：基本类型­­­ ➔ 包装类**
`Integer a = 10`，看起来是直接把 int 赋给了 Integer，实际上编译器会转成：`Integer a = Integer.valueOf(10)`
所以自动装箱底层调用的是 `Integer.valueOf()`
**2. 自动拆箱：包装类 ­­­➔ 基本类型**

```java
Integer a = 10;
int b = a;
```

实际上编译器会转成：`int b = a.intValue()`
所以自动拆箱底层调用的是 `intValue()`
类似地：

```java
Long ­­­➔ longValue()
Double ­­­➔ doubleValue()
Boolean ­­­➔ booleanValue()
```

- 包装类在自动拆箱时会调用对应的 value 方法，如果包装类对象为 null，就会触发空指针异常
### 包装类比较时不能随便使用 `==`
例如：

```java
Integer a = 100;
Integer b = 100;

System.out.println(a == b);//true
```

但是：

```java
Integer a = 200;
Integer b = 200;

System.out.println(a == b);//false
```

这是 Integer 缓存机制导致的
### Integer 的缓存机制是什么？
Java 的 Integer 类内部实现了一个静态缓存池，用于存储特定范围内的整数值对应的 Integer 对象
默认情况下，这个范围是 -128 到 127 ，当通过 `Integer.valueOf(int)` 方法创建一个在这个范围内的整数对象时，就不会每次都生成新的对象实例，而是复用缓存中现有的对象，会直接从内存中取出。
而超出这个范围就会创建不同的 Integer 对象，如上例子，200 超出了默认缓存范围
大致等价于：

```java
Integer a = new Integer(200);
Integer b = new Integer(200);
```

两个 Integer 对象地址不同，所以 `==` 为 false
#### 为什么缓存范围是-128 到 127？
- 小整数使用较为频繁，像状态码、数组下标、计数器、年龄、数量等等
- 复用对象可以减少内存开销和 GC 压力，如果每次自动装箱都创建新的 Integer 对象，会产生大量临时对象
所以 Java 对常用整数做了缓存优化
#### 对于包装类， `==` 和 `equals()` 的区别
对于包装类，`==` 比较的是对象地址，而 `equals()` 比较的是数值内容
所以
> 包装类比较数值时，应使用 `equals` 而不是 `==`，除非明确比较的是基本类型


### 讲一下数据准确性高是怎么保证的？
在金融计算中，保证数据准确信有两种方案，一种是使用 `BigDecimal`，一种是将浮点数转换为整数 `int` 计算
使用 `float` 和 `double` 类型会无法避免浮点数运算中常见的精度问题，因为这些数据类型采用二进制浮点数来表示，无法准确表示例如 `0.1`


## Object
### `==` 和 `equals` 的区别
> `==` 比较的是值，而对于基本类型而言，`==` 比较的值就是基本类型的具体数值；对于引用类型（包含包装类）而言，`==` 比较的值就是引用类型的地址（也就是**两个引用是否指向同一个对象**）

> `equals` 是 `Object` 类中的方法，默认实现大概等价于

```java
public boolean equals(Object obj) {
	return this == obj;
}
```

> 也就是说引用类型如果没有重写 `equals()`，那么 `u1.equals(u2)` 本质上和 `u1 == u2` 是差不多的，都是比较地址

#### 为什么很多类的 `equals()` 比较的是内容？
有很多类重写了 `equals()` 方法，如：`String`、`Integer`、`Long`、`Double`、`BigDecimal`、`LocalDate`
如 `String`：

```java
String s1 = new String("abc");
String s2 = new String("abc");

System.out.println(s1 == s2);//false
System.out.println(s1.equals(s2));//true
```

原因是 `==` 比较的是两个对象地址，而 `equals()` 比较的是字符串内容，创建字符串时使用了 `new String("...")`，没有复用字符串常量池中已有的字符串，因此指向了两个不同的对象
如果是：

```java
String s1 = "abc";
String s2 = "abc";

System.out.println(s1 == s2);//true
System.out.println(s1.equals(s2));//true
```

因为字符串 `s1` 创建时 `“abc” ` 被放进字符串常量池了，而 `s2` 复用了，因此二者指向的是同一个常量池对象
#### 自定义类中 `equals()` 的问题
假设一个 `User` 类

```java
class User {
	private String name;
	private Integer age;
	
	public User(String name, Integer age){
		this.name = name;
		this.age = age;
	}
}
```

然后

```java
User u1 = new User("Tom",18);
User u2 = new User("Tom",18);

System.out.println(u1 == u2);//false
System.out.println(u1.equals(u2));//false
```

为什么 `equals()` 也是 false？
因为 `User` 没有重写 `equals()`，所以默认使用 `Object` 原生的 `equals()`，等价于 `==`
如果在业务中希望两个 `User` 的 `name` 和 `age` 相同就认为是同一个用户，就需要重写 `equals()` 的判断逻辑
如

```java
@Override
public boolean equals(Object o){
	if (this == o) return true;
	if (o == null || getClass() != o.getClass()) return false;
	
	User user = (User) o;
	return Obejcts.equals(name, user.name) && Objects.equals(age, user.age);
}
```

### `hashcode` 和 `equals` 方法有什么关系？
- **一致性：** 如果两个对象使用 `equals` 方法比较结果为 `true`，那么它们的 `hashCode` 值也必须相同
- **非一致性：** 如果两个对象的 `hashCode` 值相同，他们使用 `equals` 方法比较的结果不一定为 `true`，其结果可能为 `false`，这种情况称为 **哈希冲突**
#### 为什么重写 equals 通常也要重写 hashCode？
> 集合里面重点

原因是像 `HashMap`、`HashSet` 这类集合会先用 `hashCode()` 定位桶，再用 `equals()` 判断对象是否相等
如

```java
Set<User> set = new HashSet<>();
set.add(new User("Tom",18));
set.add(new User("Tom",18));
```

如果只重写 `equals()`，不重写 `hashCode()`，可能导致两个逻辑上相等的对象被放进不同的桶里，集合去重失败
> 也就是说 `equals()` 决定两个对象逻辑上是否相等，`hashCode()` 决定对象在哈希结构中的存储位置。只重写 `equals()` 不重写 `hashCode()`，会破坏 `HashMap`、`HashSet` 的正常行为

### String、StringBuffer、StringBuilder 的区别和联系
1. **可变性：** `String` 是不可变的，一旦创建，内容无法修改，每次修改都会生成一个新的对象。而 `StringBuffer` 和 `StringBuilder` 是可变的，可以直接对字符串内容进行修改而不会创建新对象
2. **线程安全性：** `String` 因为不可变，天然线程安全。`StringBuilder` 不是线程安全的，适用于单线程环境。`StringBuffer` 是线程安全的，其方法通过 `synchronized` 关键字实现同步，适用于多线程环境
3. **性能：** `String` 性能最低，在频繁修改字符串场景下会生成大量临时对象，增加内存开销和垃圾回收压力。`StringBuilder` 性能最高，因为没有线程安全的开销，适合单线程下的字符串操作。`StringBuffer` 性能略低于 `StringBuilder`，因为线程安全机制引入了同步开销
4. **使用场景：** 字符串内容固定或不常变化，优先 `String`。频繁修改字符串且单线程环境下，用 `StringBuilder`。频繁修改字符串且多线程环境下，用 `StringBuffer`
#### String 的不可变性的原理
> String 不可变的本质是：类不可继承，内部字符数组私有且引用固定，并且不提供任何修改内部内容的方法；所有修改操作都会生成新的字符串对象

`String` 的不可变主要是由它的类设计保证的。首先，`String` 类本身是 `final` 的，不能被继承，避免子类破坏其不可变语义；其次，`String` 内部用于保存字符内容的数组是 `private final` 的，外部无法直接访问这个数组，而且 `String` 没有提供修改内部数组的方法，其内部所有看似修改字符串的方法，实际上都会返回一个新的 `String` 对象，而不会修改原对象
需要注意的是，`final` 只能保证内部数组引用不能重新指向别的数组，并不能保证数组内容不能变，真正保证不可变的是 `private` 封装加上没有暴露修改方法
`String` 设计成不可变有很多好处，比如可以安全地使用字符串常量池、可以作为 `HashMap` 的 key 保证 hash 值稳定、天然线程安全，也能提升安全性

## 反射
### 反射机制是什么？
Java 中每个类在 JVM 加载之前，都会生成一个对应的 `Class` 对象
比如有一个类：

```java
public class User{...}
```

当 `User` 类被加载进 JVM 后，JVM 内部就会有一个对应的：`Class<User>`
而这个 `Class` 对象里保存了 `User` 类的结构信息，比如
- 类名
- 构造方法
- 字段
- 方法
- 注解
- 父类
- 实现的接口
而反射就是通过这个 `Class` 对象，在 **运行时** 操作这些信息
### 如何获取 Class 对象？
常见有三种方式
#### 1. `类名.class`
这是最常用最安全的一种方式

```java
Class<User> clazz = User.class;
```

#### 2. `对象.getClass ()`
这种方式适用于已经有对象的情况

```java
User user = new User();
Class<?> clazz = user.getClass();
```

#### 3. `Class.forName()`

```java
Class<?> clazz = Class.forName("com.example.User");
```

这种方式最能体现“动态性”，因为类名是字符串，可以来自配置文件
然后程序运行时读取这个类名，再动态加载类
很多框架底层都会用这个方式
### 反射怎么用？
> 常见操作有四类：
> 1.  获取类信息
> 2. 创建对象
> 3. 操作属性
> 4. 调用方法
> 代码不依赖具体类，而是在运行时根据配置动态创建对象

#### 实际应用场景
1. **Spring IOC 创建 Bean**
2. **Spring 依赖注入**
3. **MyBatis 映射**
4. **注解解析**
	比如定义一个注解：

	```java
	@Retention(RetentionPolicy.RUNTIME)
	@Target(ElementType.METHOD)
	public @interface Log {
		String value();
	}
	```

	用在方法上：

	```java
	public class UserService {
		@Log("用户登录")
		public void login(){
		...
		}
	}
	```

5. **JUnit 测试框架**
6. **动态代理**
	AOP、事务、日志、权限校验等
	例如 Spring AOP 可以在方法执行前后增强逻辑
# Java 集合
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/0ff39ec613f65510cffa38840cd20866.png)
**Collection：** 
- List 有序，可重复，动态数组 ArrayList，链表 LinkedList
- Set 无序，不可重复，HashSet，TreeSet
- Queue 队列，双端队列 ArrayDeque，优先级队列 PriorityQueue
**Map：** 键值对，经典代表 HashMap
## List
### ArrayList 和 LinkedList 的区别，哪个集合是线程安全的？
- **底层数据结构不同：** ArrayList 使用动态数组，可以通过索引快速定位到元素；而 LinkedList 使用双向链表，即每个节点都存储了元素本身以及指向前一个和后一个节点的指针，是通过节点之间的指针关联来访问和操作元素
- **插入和删除操作的效率不同：** ArrayList 的底层实现是数组，所以在尾部插入和删除的效率较高，但如果在中间或者开头插入或删除，效率较低；LinkedList 底层是双向链表，因此在头部和尾部进行插入、删除操作时效率很高，只需要调整节点指针，但如果在中间位置操作，就需要遍历链表，时间复杂度也是 `O(n)`，找到位置之后只需要调整指针，不需要移动大量元素。LinkedList 还实现了 Deque 接口，可以当双端队列、栈来使用
- **随机访问效率不同：** ArrayList 支持通过索引快速访问元素，时间复杂度为 `O(1)`，LinkedList 不支持随机访问
- **空间占用：** ArrayList 在创建时会分配一段 **连续** 的内存空间，会有一定的容量浪费，但只需要存储元素本身。LinkedList 除了存储元素，还需要存储两个指针，在存储相同数量元素的情况下，LinkedList 空间占比会大一些
- **使用场景：** ArrayList 更适合需要频繁访问元素，或主要在尾部进行插入删除操作的场景。LinkedList 则适合需要频繁在头部或尾部进行插入删除操作的场景，或者需要作为双端队列、栈使用的场景，如果是使用迭代器直接操作已知位置的节点，在中间插入删除时也能发挥它调整指针快的优势
- **线程安全：** 这两个集合都不是线程安全，如果在多线程环境下使用需要自行加锁保证线程安全，或使用线程安全的 List 集合，如 `Vector`、`Collections.synchronizedList()` 包装的 List，或者 `CopyOnWriteArrayList`

### 为什么 ArrayList 不是线程安全的，具体来说是哪里不安全？
在高并发添加数据下，ArrayList 会暴露三个问题：
- 部分值为 null（并没有 add null 进去）
- 索引越界异常
- Size 与我们 add 的数量不符
ArrayList 的 add 增加元素代码：

```java
public boolean add(E e) {
	ensureCapacityInternal(size + 1);
	elementData[size++] = e;
	return true;
}
```

大体分为三步
1. 判断数组是否需要扩容，需要的话调用 grow 方法扩容
2. 将数组的 size 设置值
3. 将当前集合大小加 1
上述三种问题是如何产生的：
- **部分值为 null**：**size 更新、元素写入、数据扩容不是原子操作，线程交叉执行时可能把“还没写入的位置”当成有效元素拷贝到新数组中。** 并发情况下，一个线程可能已经把 `size` 增加了，但还没来得及把元素写入数组；另一个线程看到新的 `size` 后触发扩容，把旧数组中还没写入的位置，也就是 `null`，拷贝到了新数组。之后第一个线程再把元素写到旧数组中，但此时 `ArrayList` 已经指向新数组了，所以新数组中就可能留下 `null`
- **索引越界异常**：**并发下，线程检查容量可能够，但写入时 `size` 已经被别的线程改大了，于是写到了数组最大下标之外，导致索引越界。** 比如当前数组容量是 10，`size` 是 9。线程 A 执行 `add()` 时检查到 `size + 1 = 10`，认为容量够，不扩容。此时线程 A 还没写入，线程 B 也执行 `add()`，同样认为容量够，然后先把元素写入下标 9，并把 `size` 改成 10。之后线程 A 恢复执行 `elementData[size++] = e`，此时读到的 `size` 已经是 10，于是会尝试写入 `elementData[10]`。但是数组长度是 10，合法下标只有 0 到 9，所以就会抛出 `ArrayIndexOutOfBoundsException`。
### 把 ArrayList 变成线程安全有哪些方法？
- 用 Collections 类的 synchronizedList 方法将 ArrayList 包装成线程安全的 List：

	```java
	List<String> synchronizedList = Collections.synchronized(arrayList);
	```

- 用 CopyOnWriteArrayList 类代替 ArrayList，它是线程安全的 List 实现

	```java
	CopyOnWriteArrayList<String> copyOnWriteArrayList = new CopyOnWriteArrayList<>(arrayList);
	```

- 用 Vector 类代替 ArrayList，它是线程安全的 List 实现

	```java
	Vector<String> vector = new Vector<>(arrayList);
	```

## Map
### HashMap
> 是基于哈希表实现的 `Map`，它根据键的哈希值来存储和获取键值对，JDK 1.8 中使用<u>数组 + 链表 + 红黑树</u>来实现。`HashMap` 是非线程安全的，在多线程环境下可能出现数据不一致的问题。
> 需要区分两个时代：
> - **JDK 1.7** 使用头插法 + 并发扩容时可能形成环形链表，进而触发 `get()` 时的死循环；
> - **JDK 1.8** 改为尾插法后不会出现死循环，但多线程 `put()` 仍存在数据覆盖和丢失等线程安全问题

#### 实现原理
- JDK 1.7 时数据结构是数组和链表，HashMap 通过哈希算法将元素的 key 映射到数组中的槽位上，如果多个 key 映射到同一个槽位，它们就会以链表形式存储在同一个槽位上，但因为链表查询时间是 `O(N)`，所以冲突很严重，一个索引上的链表长了，效率就变低了
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/3b2021c2a665b86929f589bf0921b625.png)
- JDK 1.8 版本做了优化：当某个桶的链表长度≥**8**(`TREEIFY_THRESHOLD`)且哈希表数组长度≥**64**(`MIN_TREEIFY_CAPACITY`)时，会把链表转为 **红黑树**，从而把该桶的查找时间复杂度从 ` O(N) ` 降低到 ` O(log N) `；如果数组长度＜64，则只会触发扩容 (` resize() `)，并不会立刻树化。反向地，在 `resize()` 过程中，如果某个桶的节点数≤**6**(`UNTREEIFY_THRESHOLD`)，红黑树则会被退化回链表
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/28169a635bd48b98b4dc1dccd2e467d5.png)

#### `put()` 过程
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/e5aa84d79b8ac368a8739bca3b4cef1c.png)
> 第一步：根据要添加的键的**哈希码计算**在数组中的位置（索引）：

> 第二步：**检查该位置是否为空**（即没有键值对存在）：
- 如果为空，则直接在该位置创建一个新的 Node 对象来存储键值对。将要添加的键值对作为该 Node 的键和值，并保存在数组对应位置。将 HashMap 的修改次数（modCount）加 1，以便在进行迭代时发现并发修改
> 第三步：如果该位置已经存在了其他键值对，**检查该位置的第一个键值对的哈希码和键是否与要添加的键值对相同**？
- 如果相同，则表示找到了相同的键，直接将新的值替换旧的值，完成更新操作
> 第四步：如果第一个键值对的哈希码和键**不相同**，则需要**遍历链表或红黑树来查找是否有相同的键**：

如果键值对集合是**链表**结构，从链表头部开始逐个比较键的哈希码和 `equals()` 方法，直到找到相同的键或达到链表尾部
- 如果找到**相同**的键，则使用新的值取代旧的值，也就是**更新**键对应的值
- 如果**没有找到相同**的键，则将新的键值对**添加到链表的尾部**
如果键值对集合是**红黑树**结构，在红黑树中使用哈希码和 `equals()` 方法查找。根据键的哈希码，定位到红黑树中的某个节点，然后逐个比较键，直到找到相同的键或达到红黑树末尾
- 如果找到**相同**的键，则使用新的值取代旧的值，也就是**更新**键对应的值
- 如果**没有找到相同**的键，则将新的键值对**添加**到红黑树中
> 第五步：**检查链表长度**是否达到阈值（默认为 **8**）：
- 如果链表长度超过阈值，且 HashMap 的**数组长度大于等于 64**，则会将**链表转换为红黑树**，提高查询效率
> 第六步：**检查负载因子**是否超过阈值（默认为 **0.75**）：
- 如果**键值对的数量与数组的长度的比值大于阈值**，则需要进行**扩容**操作
> 第七步：扩容操作：
- 创建一个**新的两倍大小的数组**
- 遍历旧数组的每个键值对，根据（`e.hash & oldCap`）的结果**重新分配到新数组中**的位置（要么原位置，要么 `原位置 + oldCap`），**无需重新计算 hash**（oldCap 为旧容量）
- 更新 HashMap 的数组引用和阈值参数
> 第八步：完成添加操作

注意：HashMap 是非线程安全的，如果在多线程环境下使用，需要采取额外的同步措施或使用线程安全的 ConcurrentHashMap

#### 扩容机制
HashMap 默认负载因子是 0.75，也就是说如果 HashMap 的元素个数超过了总容量的 75%，就会出发扩容，而扩容可以分为两个步骤：
- **第 1 步**是对哈希表长度的扩展（2 倍）
- **第 2 步**是将旧哈希表中的数据放到新的哈希表中
由于使用的是 2 次幂的扩展，所以扩容后元素的位置要么在原位置要么在原位置再移动 2 次幂的位置
因此我们在扩充 HashMap 时，无需重新计算 hash
> 判断依据是 `hash & oldCap`。如果结果为 0，说明新增参与计算的那一位是 0，节点仍然留在原索引；如果结果不为 0，说明新增的那一位是 1，节点会移动到 `原索引 + oldCap`

#### HashMap 的大小为什么是 2 的 n 次方大小
HashMap 的索引计算公式是：`索引 = hash & (length -1)`
这个设计的初衷是 **用位运算替代取模运算**（因为位运算直接操作二进制位，速度远快于除法 / 取模），但它能生效的**前提**，就是 `length` 必须是 2 的 n 次方
> 原因 1：保证「位运算等价于取模」，实现**高效寻址**

当 `length` 是 2 的 n 次方时，`length - 1` 的二进制低 n 位全是 1，高位全是 0，此时做「与运算」，相当于直接把 hash 值的 **低 n 位截取下来**，这就等价于「对 length 取模」
> 原因 2：让哈希值低位**更均匀，减少碰撞**

只有当 `length - 1` 的二进制是全 1 时，才能接住均匀分布的位。比如 length=16 时，`length-1=15` (`1111`)，hash 值的低 4 位每一位都能影响最终索引；而如果 length=15, ` length-1=14 ` (` 1110 `)，最后一位直接失效，也就相当于少了一位来分散 hash，碰撞概率自然就高了
> 原因 3：**优化扩容时的元素重分配**，不用重新算 hash

### ConcurrentHashMap
#### 实现原理
> JDK 1.7 ConcurrentHashMap

在 JDK 1.7 中它使用的是数组+链表的形式实现的，而数组又分为：大数组（Segment）和小数组（HashEntry）。Segment 是一种可重入锁（ReentrantLock），在 ConcurrentHashMap 里扮演锁的角色；HashEntry 则用于存储键值对数据。一个 ConcurrentHashMap 里包含一个 Segment 数组，一个 Segment 里包含一个 HashEntry 数组，每个 HashEntry 是一个链表结构的元素
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/26d5098db694ffc75d1afdce98d6a7d6.png)
Segment 扮演锁的角色，也就是说 JDK 1.7 ConcurrentHashMap 是用分段锁技术将数据分成一段一段存储，然后给每一段数据（Segment）配一把锁，当一个线程占用锁访问其中一个段数据时，其他段的数据也能被其他线程访问，从而实现并发访问
> JDK 1.8 ConcurrentHashMap

JDK 1.7 中的 ConcurrentHashMap 虽然是线程安全的，但是底层是数组+链表的形式，在数据比较多的情况下因为需要遍历整个链表，所以访问是很慢的，而 JDK 1.8 则使用了数组+链表/红黑树的方式
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/fd8bc504f8b236159cc66e91a22002c0.png)
而 JDK 1.8 ConcurrentHashMap 主要是通过 volatile + CAS 或者 synchronized 来实现线程安全的。
添加元素时首先会判断容器是否为空：
- 如果为空则使用 volatile + CAS 来初始化
- 如果容器不为空，则根据存储的元素计算该位置是否为空
	- 如果根据存储的元素计算结果为空，则利用 CAS 设置该节点
	- 如果根据存储的元素计算结果不为空，则使用 synchronized，然后遍历桶中的数据，并替换或新增节点到桶中，最后再判断是否需要转为红黑树
一句话归纳：
> ConcurrentHashMap 通过对头结点加锁来保证线程安全，锁的粒度相比 Segment 来说更小了，发生冲突和加锁的频率降低了，并发操作的性能就提高了
> 并且 JDK 1.8 使用红黑树优化了之前的固定链表，那么当数据量较大时，查询性能也能得到很大的提升

#### 已经用了 synchronized，为什么还要用 CAS？
ConcurrentHashMap 使用了两种手段来保证线程安全主要是权衡的考虑，在某些操作中使用 synchronized 还是使用 CAS，主要是根据锁竞争程度来判断
比如在 putVal 中，如果计算出来的 hash 槽没有存放元素，那么就可以直接使用 CAS 来设置值，因为在**设置元素**时，hash 值经过各种扰动后，造成 **hash 碰撞的几率较低**，可以预测使用较少的自旋来完成具体的 hash 落槽操作（此时使用乐观锁——volatile + CAS）
当计算出来的槽位已经存在节点（也就是发生 hash 碰撞），需要遍历链表或红黑树进行查找、替换或追加节点，操作步骤较多且需要保护整条链/树结构，CAS 自旋就不合适了，所以改用 synchronized 锁住桶的头结点来完成这部分操作（此时使用悲观锁）

# Java 并发编程
## 线程的创建方式有哪些？
> 1 继承 2 实现 1 池


> 1. 继承 Thread 类

这个方法最直接，用户自定义类继承 Thread 类，重写 `run()` 方法，在 `run()` 方法中定义线程执行的具体任务。创建该类实例后，通过调用 `start()` 启动线程
- **优点**：编写简单，如果需要访问当前线程，无需使用 `Thread.currentThread()` 方法，直接使用 this. 获得当前线程
- **缺点**：因为该类已经继承了 Thread 类，所以不能在继承其他父类
> 2. 实现 Runnable 接口

如果一个类已经继承了其他类无法再继承 Thread 类，此时就可以实现 Runnable 接口。实现 Runnable 接口要重写 `run()` 方法，然后将实现 Runnable 接口的类作为参数传给 Thread 类的构造器，创建 Thread 对象后调用 `start()` 方法启动线程
- **优点**：线程类只是实现 Runnable 接口，还可以继承其他类；在这种方式下可以多个线程共享同一个目标对象，所以非常适合多个相同线程来处理同一份资源的情况
- **缺点**：编程复杂，如果需要访问当前线程，必须使用 `Thread.currentThread()`
> 3. 实现 Callable 接口与 FutureTask

Callable 接口类似 Runnable，但 Callable 的 `call()` 方法可以有返回值且可以抛出异常。而要执行 Callable 任务需要将它包装进一个 FutureTask，因为 Thread 类的构造器只接受 Runnable 参数，而 FutureTask 实现了 Runnable 接口
- **优点**：线程类只实现 Callable 接口，还可以继承其他类；且 `call()` 方法可以有返回值，也可以抛异常，配合 `FutureTask` 能方便地获取异步执行结果
- **缺点**：编程复杂，如果需要访问当前线程，必须使用 `Thread.currentThread()`
> 4. 线程池（Exector 框架）

Java 5 开始引入的 `ExecutorService` 和相关类提供了线程池的支持，这是一种更高效的线程管理方式，避免了频繁创建和销毁线程的开销。可以通过 Executors 类的静态方法创建不同类型的线程池

```java
class Task implements Runnable {
	@Override
	public void run() {
	}
}

public static void main(String[] args) {
	ExecutorService executor = Executors.newFixedThreadPool(10);//创建固定大小的线程池
	for (int i = 0; i < 100; i++){
		executor.submit(new Task());//提交任务到线程池执行
	}
	executor.shutdown();//关闭线程池
}
```

- **缺点**：线程池增加了程序复杂度，当涉及线程池参数调整和故障排查时，错误配置可能导致死锁和资源耗尽等问题，并且这些问题的诊断和修复可能比较复杂
- **优点**：线程池可以重用预先创建的线程，避免了线程创建和销毁的开销；对于需要快速响应的并发请求，线程池可以迅速提供线程来处理任务，减少等待时间；并且线程池能有效控制运行的线程数量，防止因创建过多线程导致系统资源耗尽（内存溢出）；通过合理配置线程池大小可以最大化 CPU 利用率和系统吞吐量
## 线程有几种状态？
6 种
- **new** 代表线程被创建但未启动
- **runnable** 代表线程处于就绪或正在运行状态，由操作系统调度
- **blocked** 代表线程被阻塞，等待获取锁
- **waiting** 代表线程等待其他线程的通知或中断
- **timed_waiting** 代表线程会等待一段时间，超时后自动恢复
- **terminated** 代表线程执行完毕，生命周期结束
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/db6cde67a1c45c3e5e7340e8536ce915.png)
也就是说，线程的生命周期可以分为五个主要阶段：新建、就绪、运行、阻塞和终止，而线程在运行过程中会根据状态的变化在这些阶段之间切换

## Synchronized 锁静态方法和普通方法区别？
锁的对象不同：
- **普通方法：** 锁的是当前对象实例（`this`）。**同一个对象实例**的 `synchronized` 普通方法，**同一时间只能被一个线程访问**；不同对象实例间互不影响，可被不同线程同时访问各自的同步普通方法
- **静态方法：** 锁的是当前类的 `Class` 对象。而类的 `Class` 对象全局唯一，无论多少个对象实例，该静态同步方法同一时间只能被一个线程访问
作用范围不同：
- **普通方法：** 仅对**同一对象实例**的同步方法调用互斥，不同对象实例的同步普通方法可并行执行
- **静态方法：** 对整个类的所有实例的该静态方法调用都互斥，也就是说一个线程进入静态同步方法，其他线程无法进入同一类任何实例的该方法
多实例场景影响不同：
- **普通方法：** 多线程访问**不同对象实例**的同步普通方法时，**可同时执行**
- **静态方法：** 不管有多少对象实例，同一时间仅一个线程能执行该静态同步方法
# Spring
## Spring 的事务什么情况下会失效？
> Spring 事务本质上是 **AOP 代理 + TransactionInterceptor + TransactionManager**，所以只有方法调用经过 Spring 代理，并且异常/传播/事务管理器等规则符合预期，事务才会生效并按预期回滚

Spring Boot 是通过 Spring 框架的事务管理模块来支持事务操作，通常通过 `@Transactional` 注解来实现，但也会有失效的情况：
1. **异常被 try-catch 吞掉**：在**事务方法内用 `try-catch` 捕获异常但没有再抛出**，Spring 代理感知不到异常，事务就会正常提交，回滚失效
2. **抛出的是<u>受检异常</u>（Checked Exception）**：Spring 默认只对 `RuntimeException` 和 `Error` 进行回滚，**受检异常**（如 `IOException`、`SQLException`）默认不会触发回滚，需要通过 `@Transactional(rollbackFor = Exception.class)` **显式声明**
3. **事务传播属性设置不当**：如果在多个事务之间存在**事务嵌套**，且事务传播属性配置不正确，可能导致事务失效，特别是在方法内部调用有 `@Transactional` 注解的方法时要特别注意
	传播属性设置不当会导致**事务结果和预期不一致**，比如 `REQUIRES_NEW` 会开启独立事务，内层提交后外层回滚不会影响它；`NOT_SUPPORTED` 会以非事务方式运行；`NESTED` 则依赖保存点实现部分回滚
4. **多数据源的事务管理**：如果在使用多数据源时，事务管理没有正确配置或者存在多个 `@Transactional` 注解时，可能会导致事务失效
	多数据源下就可能会有多个事务管理器，而 `@Transactional` 注解必须绑定到正确的事务管理器才能生效，如果事务管理器管理的是 A 数据源，但业务 SQL 操作的是 B 数据源，那事务就不会控制到对应连接，表现出来的就是事务失效，相关配置可以通过 `@Transaction` 的 `value` 或 `transactionManager` 属性指定要使用的事务管理器
5. **同类内部方法调用（this 调用）**：如果一个事务方法内部通过 `this` 调用（**自我调用**）另一个带 `@Transactional` 的方法，由于绕过了代理对象，事务注解也会失效
	解决办法可以是 **把事务方法拆到另一个 Bean** 或者 **注入自己的代理对象**，还可以使用 `AopContext.currentProxy()`，但需要开启代理暴露，不建议
6. **事务在非公开方法中失效**：如果 `@Transactional` 注解标注在私有方法或者非 public 方法上，事务也会失效
	Spring 事务基于代理实现，而 private 方法无法被代理增强，接口代理下事务方法也必须是 public
7. **异步线程中事务不传播**：在事务方法里开启新线程，新线程里的数据库操作不属于原事务
8. **数据库引擎不支持事务**：Spring 事务最终还是依赖底层数据库和连接

## `@Autowired` 有几种注入方式
1. **属性注入/字段注入**：直接注入到成员变量上
2. **构造器注入**：通过构造方法注入依赖
3. **Set 方法注入**：通过 set 方法注入
## @Component、@Controller、 @Service、@Repository 有啥区别
> @Controller、 @Service、@Repository 底层源码是@Component 套了层皮，创建 Bean 规则一模一样，Spring 搞出三个衍生注解，是为了靠标签管控分层，防止乱写代码

@Component，万能工具人，没有明确分层的工具类、通用公共组件，全都用它，项目哪里缺 Bean 贴哪里
@Controller，专属控制层，专门接受前端 HTTP 请求
@Service，衔接接口和 DAO，所有业务逻辑，事务控制都在这一层
@Repository，DAO 层专属注解，对接数据库 CRUD
> @Controller 独享 Web 权限，只写@Component 不写@Controller，哪怕标注了@RequestMapping，Spring 也不会把它注册成请求处理器，前端访问 404
> @Repository 自动转换数据库异常
> @Service 只有标识作用，没有框架底层特殊逻辑

## 元注解
> 注解本质是个标签、一段元数据，更多的是给类、方法、字段贴个标签，告诉编译器、框架该怎么处理，注解能存活到哪个阶段、能被谁读取，完全由@Retention 元注解定义的生命周期决定

**@Retention 定义注解的三个生命周期**：
1. **Source(源码)**：只在源码中存在，编译成字节码后就被丢弃。编译器检查用，反射读取不到。代表：@Override
2. **Class（字节码）**：会被写进 class 文件，但运行时 JVM 不会加载，反射也拿不到。代表：@JsonIgnore
3. **Runtime（运行时）**：会一直存活到运行时，Spring 容器启动反射扫描注解，根据注解属性做相应处理。代表：@Transactional、@Autowired
**@Target 定义注解的位置，类、方法、字段、参数、构造器等，可以一个或多个**
**@Documented 标记注解是否出现在 javadoc 生成的文档中**
**@Inherited 让子类继承父类上的注解，通常情况下注解不会继承，加这个元注解才能传递**
# Spring MVC
> Model-View-Controller

用户­­­➔DispatcherServlet➔HandlerMapping➔HandlerAdapter➔Handler 处理器（Controller）➔视图解析器➔视图➔用户
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/06/90037846efb8cec5c2a879d495e32e75.png)
# Spring Boot
## Spring Boot Starter
> 本质上是“依赖整合包 + 自动配置入口”，用来快速引入某一类功能所需的依赖和默认配置
> 比如 `spring-boot-starter-web` 会引入 Spring MVC、Tomcat 等 Web 开发所需的依赖。Starter 通常会配合 Spring Boot 的自动装配机制一起工作：Starter 把依赖放到 classpath 中，Spring Boot 的 AutoConfiguration 根据条件注解判断当前环境是否满足，然后自动创建默认 Bean。这样就能做到引入一个 Starter，再写少量配置，就能使用某个功能
>> 主要是减少依赖冲突和重复配置，提高项目初始化效率，在公司中也经常会封装自定义 Starter，比如统一日志、统一鉴权、统一 Redis、统一 MQ、统一监控等，让业务服务只需要引入依赖就能复用公司的基础能力
> 

## Spring Boot 自动装配

> ```
> @SpringBootApplication 开启自动装配
> @EnableAutoConfiguration 导入自动配置
> AutoConfiguration.imports 找到配置类
> @Conditional 判断是否生效
> @Bean 注册默认组件
> @ConditionalOnMissingBean 允许用户覆盖默认配置
> ```
# 消息队列
> 为什么要用到消息队列？
> **解耦**（把绑在一起的系统拆开）
> - 比如电商系统用户付完款后还会有很多连带操作，关乎到其他子系统，付完款系统直接 RPC 调用挨个通知各子系统，代码就高度耦合在一起了，如果某个子系统执行报错就可能会连累整个流程
> - 引入 MQ 之后就只需让子系统去订阅 MQ 里的流程反馈
> **异步**
> - 如果串行执行各种非核心流程，整个流程走下来会导致用户页面等待时间过于冗长，而有 MQ 之后就只需要管主流程
> - 其余非核心流程则在后台顺着 MQ 慢慢执行，用户感知的响应时间就随之变短了
> **削峰**
> - 在高并发场景下扮演「蓄水池」或者「排队区」
> - 瞬时请求过来可以先扔进 MQ 里暂存，再根据自己数据库的抗压能力慢慢从 MQ 里往外拉任务消化
> - 用户感知上就是排队时间多了而不是系统直接崩溃
## RabbitMQ
### 核心组件
![image.png](https://pub-f0ec440a5c1b4b63a1d2c9eaaf0c6b3a.r2.dev/2026/05/96dd8aaa575645384f8bed4ebaf00e10.png)
- **生产者（Producer、Publisher）**：产生发送
- **消费者（Consumer）**：监听处理
- **队列（Queue）**：存储
- **交换机（Exchange）**：消息分发器
- **路由键（RoutingKey）和绑定（Binding）**：把交换机和队列关联起来
- **连接（Connections）和信道（Channel）**：Connection 是客户端和 RabbitMQ 之间的 TCP 长连接，Channel 是建立在连接之上的轻量级信道，TCP 创建销毁的开销大，所以用多个信道来传输消息
> 生产者发消息给交换机，交换机通过路由键和绑定，把消息投到队列，最后消费者再从队列取消息消费

### 延迟队列和死信队列
**延迟队列**的核心就是让消息不是发出去就被消费，而是等到指定时间才让消费者消费
具体的应用场景就比如电商里订单创建后 15 分钟没支付要自动取消，就可以使用延迟队列。
生产者发消息的时候给消息设置一个延迟时间，这个消息会先到一个专门的延迟交换机，而交换机不会马上转发而是等够了设置的时间，再把消息转到真正的业务队列，消费者监听这个业务队列，到点就收到消息执行取消订单的逻辑即可
**死信队列**则是给无法正常处理的消息找个兜底的地方，防止它们一直堆在业务队列里占资源
1. 消费者处理消息时出了问题，明确拒绝接收而且不让它重新回到原队列
2. 消息在队列里放太久过期了
3. 队列满了新消息进不来，最老的会被挤进死信队列
然后就可以通过监听死信队列记录日志找问题或者人工处理或者设置重试机制

> 延迟队列管「消息什么时候处理」，死信队列管「消息处理失败或过期了怎么办」

# 云原生
## Docker
> 常用命令
> `docker ps`
> `docker images`
> `docker exec -it 容器名 bash`


## Kubernetes
> 容器编排，管理容器的部署、扩缩容、服务发现、故障修复和滚动更新
> 常用命令：kubectl get/describe/logs/exec/apply

### 和 docker 的关系
- Docker 主要负责容器的构建和运行，比如把应用打成镜像、启动容器
- `K8s` 主要负责管理大量容器，比如部署、扩缩容、服务发现、故障恢复和滚动更新
Docker 单机容器运行，`K8s` 集群级容器编排
### Kubernetes 是什么，用来做什么解决什么问题
`k8s` 是一个容器编排平台，主要用来管理容器化应用的部署、运行、扩缩容、服务发现和故障修复
Docker 可以用来启动单个容器，但当服务多、实例多，并且需要一些自动重启、滚动发布、负载均衡时，使用 docker 来手动管理就会很麻烦，`k8s` 可以通过声明式配置管理这些容器，让应用按我们期望的状态运行
#### Pod 是什么
> Pod 是 `k8s` 中**最小的调度单位**，一个 Pod 里可以包含一个或多个容器，通常一个业务服务的一个实例就会运行在一个 pod 里
> 但 Pod 不是长期稳定的资源，可能会因为**重启、扩缩容、节点故障而被重新创建**，所以一般不直接依赖 Pod IP，而是通过 Service 访问
>> 实际开发中通常不直接创建 Pod，而是通过 Deployment 来管理 Pod
> 

#### Delopyment 是什么
>> 副本管理、滚动更新、自动回复、版本回滚
> Deployment 是用来管理一组 Pod 副本的资源对象，它可以保证指定数量的 Pod 一直运行，比如设置 `replicas` 为 3，就会尽量保证有 3 个实例
> 并且支持滚动更新、版本回滚和故障自愈，如果某个 Pod 挂了，Deployment 会自动拉起新的 Pod

#### Service 是什么，有什么用
> Pod 是不稳定的，Pod 重启或者重新调度后 IP 可能会变化，而如果其他服务直接访问 Pod IP，就会出问题
> Service 的作用就是给一组 Pod 提供一个稳定的访问入口，通过 label selector 选择后端 Pod，然后把请求转发到对应的 Pod 上
>> 比如说订单服务要调用用户服务，不应该直接写某个 Pod IP，而是访问用户服务对应的 Service
> 

#### Ingress 和 Service
>> Service 是服务入口，Ingress 是 HTTP 网关入口
> Service 主要解决集群内部服务访问和负载均衡的问题，而 Ingress 更偏向于 HTTP/HTTPS 七层入口
> Ingress 可以根据域名、路径把请求转发到不同的 Service，比如 `/api/user` 转发到用户服务，`/api/order` 转发到订单服务

#### ConfigMap 和 Secret
> ConfigMap 用来保存普通配置，比如环境变量、配置文件内容；Secret 用来保存敏感信息，比如数据库密码、Token、密钥
> 把配置和镜像解耦，**避免把配置写死在代码或镜像里**

### Kubernetes 怎么部署一个 Spring Boot 服务
- 首先把项目打成 jar 包，然后编写 Dockerfile，把应用构建成镜像
- 接着把镜像推送到镜像仓库，然后写 `K8s` 的 Deployment 配置，指定镜像、端口、副本数、环境变量等
- 如果当前服务需要被其他服务访问，再创建 Service
- 如果需要对外提供 HTTP 访问，可以再配置 Ingress
- 部署后可以用 `kubectl get pods` 查看状态，用 `kubectl logs` 查看日志