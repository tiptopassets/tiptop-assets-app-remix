
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AccountPage = () => {
  const { user } = useAuth();
  
  const fullName = user?.user_metadata?.full_name || 'User';
  const email = user?.email || 'Not provided';
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center">
          <User className="mr-2 text-tiptop-purple" size={32} />
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>
        
        <p className="text-gray-600">
          Manage your personal information and account settings.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="overflow-hidden border-0 shadow-md relative">
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
              
              <CardHeader className="relative z-10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-6 flex flex-col items-center">
                <div className="mb-4 w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-tiptop-purple">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold">{fullName}</h2>
                <p className="text-gray-500">{email}</p>
                
                <div className="mt-6 w-full">
                  <Button className="w-full mb-2">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full overflow-hidden border-0 shadow-md relative">
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
              
              <CardHeader className="relative z-10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Email Notifications</h3>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span>Receive payment notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-tiptop-purple/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiptop-purple"></div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <Button variant="outline" className="w-full">
                    Add Payment Method
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Security</h3>
                  <Button variant="outline" className="w-full mb-2">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AccountPage;
