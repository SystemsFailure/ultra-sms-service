export const formatPhone = (phone: string): string => {
  return phone.replace(/[^\d]/g, "").replace(/^8/, "7");
};
