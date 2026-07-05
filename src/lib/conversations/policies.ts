export function isResolutionConfirmation(content: string) {
  const normalized = content.toLowerCase().replace(/[\s，。！？!?,、]/g, "");
  return [
    "问题已经解决",
    "问题解决了",
    "已经解决了",
    "已经解决",
    "已解决谢谢",
    "解决了感谢",
    "已经好了",
  ].some((phrase) => normalized.includes(phrase));
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || value.includes("****")) return value;
  return `${digits.slice(0, 3)} **** ${digits.slice(-4)}`;
}

export function maskEmail(value: string) {
  const [local, domain] = value.split("@");
  if (!local || !domain || local.includes("***")) return value;
  return `${local.slice(0, 1)}***@${domain}`;
}
