import { get } from "../../../shared/utils/api";

// كل مادة المجال في نداء واحد، للتنزيل ملفاً
export const getDomainContent = (domainId) => get(`/content/domain/${domainId}`);
