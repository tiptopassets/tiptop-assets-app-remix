
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Wifi } from "lucide-react";

const InternetDashboard = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center">
          <Wifi className="mr-2 text-tiptop-purple" size={32} />
          <h1 className="text-3xl font-bold">Internet Asset</h1>
        </div>
        
        <p className="text-gray-600">
          Detailed information about your internet bandwidth sharing program.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <CardTitle>Internet Connection Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>This section would contain specific details about the internet asset.</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <CardTitle>Bandwidth Usage</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>This section would contain bandwidth usage metrics for the internet asset.</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default InternetDashboard;
