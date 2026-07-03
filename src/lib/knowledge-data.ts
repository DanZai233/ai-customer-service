export type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  content: string;
  status: "published" | "draft";
  source: "manual" | "document" | "website";
  updatedAt: string;
  hits: number;
};

export type KnowledgeMatch = {
  article: KnowledgeArticle;
  score: number;
};

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "kb-001",
    title: "物流停滞与异常件处理规则",
    category: "订单与物流",
    content:
      "物流信息超过 48 小时未更新时，客服应先核对运单号并创建承运商核查单。普通订单承诺 24 小时内反馈，高价值客户可升级为优先工单。未经核实不得承诺具体送达时间。",
    status: "published",
    source: "manual",
    updatedAt: "今天 13:40",
    hits: 284,
  },
  {
    id: "kb-002",
    title: "退款申请条件与到账时间",
    category: "售后政策",
    content:
      "未发货订单可直接申请退款。已发货订单需完成拒收或退货入库后退款。原路退款通常在 1 至 5 个工作日到账，节假日可能顺延。大额退款必须由人工客服确认。",
    status: "published",
    source: "document",
    updatedAt: "昨天 18:22",
    hits: 436,
  },
  {
    id: "kb-003",
    title: "电子发票开具与抬头修改",
    category: "发票与财务",
    content:
      "订单完成后可在订单详情中申请电子发票。发票开具前可自行修改抬头；开具后如需修改，需先申请红冲并重新开具，处理时间为 2 至 3 个工作日。",
    status: "published",
    source: "website",
    updatedAt: "7 月 1 日",
    hits: 198,
  },
  {
    id: "kb-004",
    title: "企业版续费报价流程",
    category: "销售与续费",
    content:
      "企业版续费报价需确认当前席位数、增购计划和合同周期。客服收集信息后转交客户成功团队，标准报价单在 1 个工作日内发送。折扣不得由客服直接承诺。",
    status: "published",
    source: "manual",
    updatedAt: "6 月 29 日",
    hits: 92,
  },
  {
    id: "kb-005",
    title: "周末及法定节假日服务时间",
    category: "服务说明",
    content:
      "AI 客服提供 7×24 小时基础咨询。人工客服服务时间为工作日 09:00 至 21:00、周末 10:00 至 18:00。退款、合同和账户安全问题由人工处理。",
    status: "draft",
    source: "manual",
    updatedAt: "6 月 28 日",
    hits: 31,
  },
];

function tokenize(value: string) {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .replace(/[，。！？、；：,.!?;:\s]/g, "")
        .split(""),
    ),
  ).filter(Boolean);
}

export function searchKnowledge(
  query: string,
  articles: KnowledgeArticle[] = knowledgeArticles,
): KnowledgeMatch[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  return articles
    .filter((article) => article.status === "published")
    .map((article) => {
      const title = article.title.toLowerCase();
      const corpus =
        `${article.title}${article.category}${article.content}`.toLowerCase();
      const matchedTokens = queryTokens.filter((token) =>
        corpus.includes(token),
      ).length;
      const titleMatches = queryTokens.filter((token) =>
        title.includes(token),
      ).length;
      const phraseBonus = corpus.includes(
        query.toLowerCase().replace(/\s/g, ""),
      )
        ? 0.25
        : 0;
      const score = Math.min(
        0.99,
        matchedTokens / queryTokens.length + titleMatches * 0.03 + phraseBonus,
      );

      return { article, score };
    })
    .filter((match) => match.score >= 0.2)
    .sort((a, b) => b.score - a.score);
}

export function buildKnowledgeContext(query: string) {
  return searchKnowledge(query)
    .slice(0, 3)
    .map(
      ({ article }, index) =>
        `[资料 ${index + 1}] ${article.title}\n${article.content}`,
    )
    .join("\n\n");
}
