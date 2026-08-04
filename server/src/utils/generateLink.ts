export function generateLink(
  baseUrl: string,
  type: "RESET_PASSWORD" | "INVITE" | "CHANGE_EMAIL",
  role: string,
  token: string,
  id?: string,
) {
  let path = "";

  if (type === "INVITE") {
    path = "/company/accept-invite";
    return `${baseUrl}${path}?token=${token}&id=${id}`;
  } else if (type == "CHANGE_EMAIL") {
    path = "/verify-email-change";
    return `${baseUrl}${path}?token=${token}`;
  } else {
    switch (role) {
      case "company_admin":
        path = "/company/reset-password";
        break;
      case "recruiter":
        path = "/recruiter/reset-password";
        break;
      case "admin":
        path = "/admin/reset-password";
        break;
      default:
        path = "/reset-password";
    }
  }

  return `${baseUrl}${path}?token=${token}`;
}
