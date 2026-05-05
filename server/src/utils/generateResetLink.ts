export function generateResetLink(
  baseUrl: string,
  role: string,
  token: string,
) {
  let path = "";

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
      path = "/reset-password"; // user
  }

  return `${baseUrl}${path}?token=${token}`;
}
