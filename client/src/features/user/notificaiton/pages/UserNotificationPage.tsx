import NotificationsPage from "../../../shared/pages/NotificationPage";
import { Header } from "../../shared/components/Header";

export default function UserNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationsPage />
    </div>
  );
}
