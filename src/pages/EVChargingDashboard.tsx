
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BatteryCharging } from "lucide-react";

const EVChargingDashboard = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center">
          <BatteryCharging className="mr-2 text-tiptop-purple" size={32} />
          <h1 className="text-3xl font-bold">EV Charging Asset</h1>
        </div>
        
        <p className="text-gray-600">
          Detailed information about your electric vehicle charging station.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden border-0 shadow-md relative">
            {/* Enhanced Glassmorphism effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
            <div className="absolute inset-0 bg-white/50 z-0"></div>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur opacity-50 -z-10"></div>
            
            <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 relative z-10">
              <CardTitle>Charging Station Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <p>This section would contain specific details about the EV charging asset.</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-md relative">
            {/* Enhanced Glassmorphism effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
            <div className="absolute inset-0 bg-white/50 z-0"></div>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur opacity-50 -z-10"></div>
            
            <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 relative z-10">
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <p>This section would contain usage statistics for the EV charging asset.</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default EVChargingDashboard;
