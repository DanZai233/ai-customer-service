export const templateGroups = [
  "零售消费",
  "软件服务",
  "专业服务",
  "生活服务",
  "企业服务",
] as const;

export type TemplateGroup = (typeof templateGroups)[number];

export type IndustryTemplate = {
  id: string;
  group: TemplateGroup;
  industry: string;
  name: string;
  description: string;
  suitableFor: string;
  tags: string[];
  sampleQuestions: string[];
  integrationExample: {
    externalId: string;
    channel: "web" | "wechat" | "email";
    customer: { externalId: string; name: string; email: string };
    message: { externalId: string; content: string };
    tags: string[];
  };
  documents: Array<{
    slug: string;
    title: string;
    category: string;
    content: string;
  }>;
};

export const industryTemplates: IndustryTemplate[] = [
  {
    id: "ecommerce-retail",
    group: "零售消费",
    industry: "电商零售",
    name: "电商订单与售后",
    description: "覆盖发货、物流、退换货、优惠活动和高风险售后升级。",
    suitableFor: "品牌商城、平台店铺、私域电商",
    tags: ["订单", "物流", "退款", "优惠"],
    sampleQuestions: [
      "订单什么时候发货？",
      "收到商品后不合适怎么退？",
      "优惠券为什么不能使用？",
    ],
    integrationExample: {
      externalId: "shop-order-20260704-001",
      channel: "web",
      customer: {
        externalId: "shop-customer-1001",
        name: "张女士",
        email: "zhang@example.com",
      },
      message: {
        externalId: "shop-message-001",
        content: "订单 20260704001 什么时候发货？",
      },
      tags: ["订单咨询", "电商"],
    },
    documents: [
      {
        slug: "shipping",
        title: "订单发货与物流查询规范",
        category: "电商零售 / 订单物流",
        content:
          "适用问题：客户查询发货时间、物流轨迹或签收异常。标准答复：先核对订单号和收货手机号后四位；已发货时提供承运商和最新节点，未发货时说明商品承诺时效。不得编造物流状态。超过承诺发货时间、物流停滞超过 48 小时、显示签收但客户未收到时，记录订单号并转人工核查。",
      },
      {
        slug: "returns",
        title: "退换货与退款处理边界",
        category: "电商零售 / 售后",
        content:
          "适用问题：七天无理由、质量问题、少件错件和退款进度。标准答复：先确认签收时间、商品状态和问题类型，再说明当前店铺公开的退换条件及预计处理时效。涉及生鲜、定制、已拆封特殊商品时不得直接承诺可退。质量安全、批量客诉、金额争议或平台介入场景必须转人工。",
      },
      {
        slug: "promotions",
        title: "优惠活动与价格争议回复规范",
        category: "电商零售 / 营销活动",
        content:
          "适用问题：优惠券不可用、满减计算、活动价变化和保价。标准答复：说明优惠券门槛、适用品类、有效期及叠加规则，并引导客户提供券名称和购物车截图。不得承诺系统规则以外的补差或赔付。出现活动页面与结算规则不一致、疑似系统故障或舆情风险时立即转人工。",
      },
    ],
  },
  {
    id: "saas-b2b",
    group: "软件服务",
    industry: "SaaS 软件",
    name: "SaaS 试用与订阅支持",
    description: "覆盖试用开通、账号权限、套餐计费、故障和数据安全问答。",
    suitableFor: "企业软件、开发者工具、云服务",
    tags: ["试用", "订阅", "权限", "故障"],
    sampleQuestions: [
      "怎么邀请团队成员？",
      "升级套餐后什么时候生效？",
      "数据导出失败怎么办？",
    ],
    integrationExample: {
      externalId: "saas-trial-acme-001",
      channel: "web",
      customer: {
        externalId: "acme-admin",
        name: "陈经理",
        email: "chen@acme.example",
      },
      message: {
        externalId: "saas-message-001",
        content: "试用账号如何邀请 20 位团队成员？",
      },
      tags: ["试用咨询", "企业客户"],
    },
    documents: [
      {
        slug: "onboarding",
        title: "试用开通与团队初始化",
        category: "SaaS / 上手指南",
        content:
          "适用问题：注册、试用开通、邀请成员和角色权限。标准答复：先确认客户是工作空间所有者还是成员，再按产品内真实菜单给出步骤。涉及域名验证、单点登录或批量导入时收集组织名称和错误提示。不得代替管理员修改权限；无法登录、权限异常或企业级配置需转技术支持。",
      },
      {
        slug: "billing",
        title: "套餐订阅、续费与发票说明",
        category: "SaaS / 商务计费",
        content:
          "适用问题：套餐差异、升级降级、续费、用量和发票。标准答复：引用当前公开套餐、计费周期和生效规则，说明价格以结算页或合同为准。不得口头承诺折扣、退款或合同条款。大客户报价、历史账单争议、自动续费取消失败和发票抬头错误应转商务或财务。",
      },
      {
        slug: "incidents",
        title: "产品故障与数据安全升级流程",
        category: "SaaS / 技术支持",
        content:
          "适用问题：功能报错、性能下降、数据导入导出失败和安全咨询。先收集时间、账号、页面、复现步骤、请求 ID 和脱敏截图，并查询公开服务状态。不得要求客户发送密码、完整密钥或敏感原始数据。疑似数据泄露、跨租户访问、核心功能大面积不可用时立即升级安全或事故响应团队。",
      },
    ],
  },
  {
    id: "education-training",
    group: "专业服务",
    industry: "教育培训",
    name: "课程咨询与教务服务",
    description: "覆盖课程匹配、试听报名、排课、请假退费和未成年人保护。",
    suitableFor: "职业教育、语言培训、素质教育",
    tags: ["课程", "试听", "排课", "退费"],
    sampleQuestions: [
      "课程适合零基础吗？",
      "可以改上课时间吗？",
      "缺课后能补课吗？",
    ],
    integrationExample: {
      externalId: "edu-trial-lesson-001",
      channel: "wechat",
      customer: {
        externalId: "edu-parent-1001",
        name: "王女士",
        email: "wang@example.com",
      },
      message: {
        externalId: "edu-message-001",
        content: "孩子 10 岁零基础，可以先预约试听吗？",
      },
      tags: ["试听预约", "课程咨询"],
    },
    documents: [
      {
        slug: "course-consulting",
        title: "课程咨询与试听预约规范",
        category: "教育培训 / 课程咨询",
        content:
          "先了解学习目标、当前基础、可上课时间和所在城市，再介绍适配课程、班型与试听方式。课程效果因个人投入而异，不得承诺考试必过、固定提分或就业结果。涉及未成年人时只收集完成预约所需的最少信息，不在公开会话索要身份证、学校班级等敏感资料。",
      },
      {
        slug: "scheduling",
        title: "排课、请假与补课处理",
        category: "教育培训 / 教务",
        content:
          "适用问题：上课时间、请假、调课、补课和课程有效期。先核对学员账号和课程订单，再引用已签署协议或公开教务规则。不得自行延长课包有效期或承诺指定教师。临时停课、连续缺课、系统排课冲突和教师投诉应转教务专员处理。",
      },
      {
        slug: "refunds",
        title: "退课退费与投诉升级边界",
        category: "教育培训 / 售后",
        content:
          "退课退费需依据合同、已消耗课时、赠课和服务费规则核算。客服可解释流程和所需材料，但不得直接承诺金额与到账日期。合同理解争议、未成年人监护人异议、分期支付、监管投诉或较大金额争议必须记录诉求并转售后负责人。",
      },
    ],
  },
  {
    id: "healthcare-clinic",
    group: "专业服务",
    industry: "医疗健康",
    name: "医疗预约与就诊服务",
    description: "覆盖预约、检查准备、报告进度和医疗安全转人工边界。",
    suitableFor: "诊所、体检中心、互联网医疗服务",
    tags: ["预约", "就诊", "报告", "医疗安全"],
    sampleQuestions: [
      "怎么改预约时间？",
      "检查前需要空腹吗？",
      "报告多久能出来？",
    ],
    integrationExample: {
      externalId: "clinic-appointment-001",
      channel: "wechat",
      customer: {
        externalId: "clinic-patient-1001",
        name: "李先生",
        email: "li@example.com",
      },
      message: {
        externalId: "clinic-message-001",
        content: "我想把明天上午的体检改到周五。",
      },
      tags: ["预约改期", "医疗服务"],
    },
    documents: [
      {
        slug: "appointments",
        title: "预约、改期与取消流程",
        category: "医疗健康 / 预约服务",
        content:
          "客服仅处理机构、科室、医生排班、预约改期和取消等服务信息。先通过合规方式核验预约人，再按实时号源操作；不得承诺加号或插队。涉及急诊症状、术后异常、药物不良反应或客户表达自伤风险时，停止普通问答，提示立即联系当地急救服务并转专业人员。",
      },
      {
        slug: "preparation",
        title: "检查准备事项答复规则",
        category: "医疗健康 / 检查服务",
        content:
          "检查准备只能引用机构已审核发布的项目须知，例如是否空腹、停药要求、携带材料和到院时间。不得基于客户症状给出诊断、用药或停药建议。若客户有孕期、过敏史、慢性病、正在服药或不确定项目要求，应转护士或医生确认。",
      },
      {
        slug: "reports",
        title: "报告进度与隐私保护",
        category: "医疗健康 / 报告服务",
        content:
          "可说明报告预计出具时间、领取渠道和身份核验方式，但不得解读指标、判断疾病或预测治疗结果。不得在未核验身份的聊天中发送完整报告、证件或病历。报告超期、姓名信息错误、结果异常咨询和第三方代领请求必须转人工按隐私制度处理。",
      },
    ],
  },
  {
    id: "financial-services",
    group: "专业服务",
    industry: "金融服务",
    name: "金融账户与交易服务",
    description: "覆盖账户操作、交易异常、费用解释和合规风险升级。",
    suitableFor: "支付、保险、证券及金融科技服务",
    tags: ["账户", "交易", "费用", "合规"],
    sampleQuestions: [
      "提现为什么还没到账？",
      "如何修改绑定手机？",
      "这笔费用是什么？",
    ],
    integrationExample: {
      externalId: "finance-withdrawal-001",
      channel: "web",
      customer: {
        externalId: "finance-customer-1001",
        name: "赵先生",
        email: "zhao@example.com",
      },
      message: {
        externalId: "finance-message-001",
        content: "昨天发起的提现为什么还没有到账？",
      },
      tags: ["交易查询", "金融服务"],
    },
    documents: [
      {
        slug: "accounts",
        title: "账户与身份验证服务边界",
        category: "金融服务 / 账户",
        content:
          "账户查询、手机号修改和身份认证必须使用机构批准的核验流程。客服不得索要密码、短信验证码、支付密码、完整银行卡号或私钥，也不得代客户绕过风控。账户疑似被盗、设备异常、身份信息冒用或客户无法完成安全验证时，立即冻结普通操作引导并转安全专员。",
      },
      {
        slug: "transactions",
        title: "交易状态与到账时效说明",
        category: "金融服务 / 交易",
        content:
          "根据真实系统状态说明受理中、成功、失败或退回，并引用公开的银行或渠道处理时效。不得承诺具体到账时刻或先行赔付。重复扣款、金额不符、陌生交易、长时间停滞、大额异常和客户声称受骗时，应记录交易号并立即转风控或人工坐席。",
      },
      {
        slug: "compliance",
        title: "投资保险咨询与合规话术",
        category: "金融服务 / 合规",
        content:
          "只可解释已审核的产品事实、费用和办理流程，不得承诺保本、收益、理赔结果或使用诱导性比较。涉及个性化投资建议、信用审批、拒付、反洗钱调查、保险责任认定和监管投诉时，客服应说明需要持牌或授权人员处理，并完整记录客户诉求后转人工。",
      },
    ],
  },
  {
    id: "travel-hospitality",
    group: "生活服务",
    industry: "旅游酒店",
    name: "旅游预订与行程保障",
    description: "覆盖预订确认、变更取消、入住出行和突发中断处理。",
    suitableFor: "酒店、旅行社、票务和目的地服务",
    tags: ["预订", "改签", "入住", "行程异常"],
    sampleQuestions: [
      "可以提前入住吗？",
      "航班取消后怎么办？",
      "订单能改日期吗？",
    ],
    integrationExample: {
      externalId: "travel-booking-001",
      channel: "email",
      customer: {
        externalId: "travel-guest-1001",
        name: "周女士",
        email: "zhou@example.com",
      },
      message: {
        externalId: "travel-message-001",
        content: "航班取消了，酒店订单可以改到后天吗？",
      },
      tags: ["行程变更", "紧急"],
    },
    documents: [
      {
        slug: "booking",
        title: "预订确认与入住出行信息",
        category: "旅游酒店 / 预订",
        content:
          "先核对订单号、入住或出行日期及预订人，再说明确认状态、凭证、地址、时间和携带材料。提前入住、延迟退房、房型升级和特殊服务以供应商实时确认结果为准，不得直接承诺。姓名错误、重复预订或供应商查不到订单时转人工核查。",
      },
      {
        slug: "changes",
        title: "改期、取消与退款规则",
        category: "旅游酒店 / 变更退款",
        content:
          "改期取消必须引用订单对应的退改政策，而非通用经验。说明可能产生的价差、手续费和审核时效，不得保证供应商一定同意。不可取消订单、多人行程拆分、签证关联订单、金额争议和临近出行时间的紧急变更应优先转人工。",
      },
      {
        slug: "disruption",
        title: "行程中断与现场安全升级",
        category: "旅游酒店 / 应急服务",
        content:
          "航班取消、自然灾害、酒店无法入住或客户人身安全受威胁时，优先确认客户所在地点和安全状态，并提供官方应急联系方式。不得给出未经确认的替代安排或赔付承诺。涉及失联、受伤、治安事件和大面积行程中断时立即升级应急团队。",
      },
    ],
  },
  {
    id: "local-services",
    group: "生活服务",
    industry: "本地生活",
    name: "到店与履约客诉处理",
    description: "覆盖预约、配送、服务履约、退款和门店客诉。",
    suitableFor: "餐饮、美业、家政、维修和连锁门店",
    tags: ["预约", "配送", "履约", "客诉"],
    sampleQuestions: [
      "预约可以改时间吗？",
      "外卖少了一份怎么办？",
      "服务不满意怎么处理？",
    ],
    integrationExample: {
      externalId: "local-service-order-001",
      channel: "wechat",
      customer: {
        externalId: "local-customer-1001",
        name: "孙女士",
        email: "sun@example.com",
      },
      message: {
        externalId: "local-message-001",
        content: "师傅已经迟到半小时，什么时候能到？",
      },
      tags: ["履约异常", "本地生活"],
    },
    documents: [
      {
        slug: "reservations",
        title: "预约、到店与上门服务规范",
        category: "本地生活 / 预约履约",
        content:
          "确认门店或服务区域、预约时间、项目和联系人后，再根据实时排班答复。不得承诺未确认的技师、包间、上门时间或额外服务。预约冲突、服务人员迟到、地址超区、客户无人接听或现场无法履约时，应主动记录并转门店或调度处理。",
      },
      {
        slug: "delivery",
        title: "配送缺漏与商品问题处理",
        category: "本地生活 / 配送售后",
        content:
          "缺件、错件、破损和超时先核对订单、商品及现场情况，可按公开规则引导补送、退款申请或门店核实。不得要求客户重复提供不必要的敏感信息，也不得自行承诺现金赔偿。食品安全、异物、疑似过敏和群体性问题必须立即转高级客服。",
      },
      {
        slug: "complaints",
        title: "服务投诉与升级处理",
        category: "本地生活 / 客诉",
        content:
          "先复述客户核心诉求并记录时间、门店、服务项目和期望方案，避免争辩或归责。可说明核查流程和预计回复时效，不得在事实未确认前承认责任或承诺赔付。人身伤害、财物损失、歧视骚扰、媒体曝光和监管投诉立即升级负责人。",
      },
    ],
  },
  {
    id: "manufacturing-b2b",
    group: "企业服务",
    industry: "制造业 B2B",
    name: "询报价与技术售后",
    description: "覆盖产品选型、询报价、交期、质量问题和技术支持升级。",
    suitableFor: "设备、零部件、材料和工业品企业",
    tags: ["询价", "交期", "选型", "质量"],
    sampleQuestions: [
      "这个型号能替代旧型号吗？",
      "批量订单交期多久？",
      "设备报警怎么处理？",
    ],
    integrationExample: {
      externalId: "b2b-rfq-001",
      channel: "email",
      customer: {
        externalId: "factory-procurement-1001",
        name: "采购部刘工",
        email: "liu@factory.example",
      },
      message: {
        externalId: "b2b-message-001",
        content: "需要 500 件 A-100 型号，能否提供交期和含税报价？",
      },
      tags: ["询报价", "企业客户"],
    },
    documents: [
      {
        slug: "selection",
        title: "产品选型与技术参数答复边界",
        category: "制造业 / 售前技术",
        content:
          "只引用已发布的规格书、兼容列表和认证信息。先收集应用场景、关键参数、环境条件和目标型号，再给出可核验的候选范围。不得在信息不足时承诺完全兼容、替代或达到特定性能。涉及安全等级、非标工况和系统集成应转售前工程师。",
      },
      {
        slug: "quotation",
        title: "询价、样品与交期处理流程",
        category: "制造业 / 商务",
        content:
          "询价需收集公司、型号、数量、交付地、含税要求和期望日期。客服可说明目录价和标准交期范围，但正式价格、库存与交期以销售报价单为准。批量折扣、账期、出口、定制、招投标和紧急插单必须转销售或供应链确认。",
      },
      {
        slug: "aftersales",
        title: "设备故障与质量问题升级",
        category: "制造业 / 技术售后",
        content:
          "先记录产品序列号、安装日期、运行环境、报警代码、现象和已采取措施。仅提供经过审核的安全排查步骤，不得指导客户绕过联锁、拆除防护或带电作业。停产、冒烟异味、人身安全、批量质量问题和保修争议应立即升级技术或质量团队。",
      },
    ],
  },
];

export function getIndustryTemplate(templateId: string) {
  return (
    industryTemplates.find((template) => template.id === templateId) ?? null
  );
}
