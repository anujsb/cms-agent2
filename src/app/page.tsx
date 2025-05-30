// app/page.tsx
"use client"
import ChatWindow from "@/components/ChatWindow";
import UserSelector from "@/components/UserSelector";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Calendar, 
  Package, 
  ShieldCheck, 
  UserCircle2,
  MessageSquare,
  LayoutGrid,
  History,
  BarChart3
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TopIssuesSummary from "@/components/TopIssuesSummary";

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  orders: {
    orderId: string;
    productName: string;
    inServiceDate: string;
    outServiceDate: string | null;
    plan: string;
    status: string;
  }[];
  incidents: {
    incidentId: string;
    date: string;
    description: string;
    status: string;
  }[];
}

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUser) return;
    
    async function fetchUserDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${selectedUser}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error('Failed to fetch user details');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserDetails();
  }, [selectedUser]);

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Customer Care Portal</h1>
          <p className="text-gray-500">Manage customer interactions and support tickets efficiently</p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-2">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-300 pr-4">
            <Card className="shadow-lg border-gray-200 rounded-xl mb-6 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
                <CardTitle className="flex items-center">
                  <UserCircle2 className="mr-2" size={20} />
                  <span>Customer Care Agent.</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-6">
                  <h3 className="text-xs uppercase font-semibold mb-2 text-gray-500 tracking-wider">Select Customer</h3>
                  <UserSelector onUserChange={handleUserChange} />
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-20 w-full mt-4" />
                    </div>
                  </div>
                ) : user ? (
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <UserCircle2 size={20} className="mr-2 text-blue-600" />
                        {user.name}
                      </h2>
                      <div className="flex items-center mt-2 text-gray-600 bg-gray-50 p-2 rounded-md">
                        <Phone size={16} className="mr-2 text-blue-600" />
                        <span className="font-medium">{user.phoneNumber}</span>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-xs uppercase font-semibold mb-2 text-gray-500 tracking-wider flex items-center">
                          <ShieldCheck size={14} className="mr-1 text-blue-600" /> Active Plan
                        </h3>
                        {user.orders.find(o => o.status === "Active") ? (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                {user.orders.find(o => o.status === "Active")?.productName}
                              </span>
                              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">Active</Badge>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                              <Calendar size={14} className="mr-1 text-blue-600" />
                              <span>
                                From {user.orders.find(o => o.status === "Active")?.inServiceDate} 
                                {user.orders.find(o => o.status === "Active")?.outServiceDate 
                                  ? ` to ${user.orders.find(o => o.status === "Active")?.outServiceDate}` 
                                  : ""}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <p className="text-gray-500">No active plan</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <TopIssuesSummary userId={selectedUser} />
                    
                    <Tabs defaultValue="orders" className="w-full">
                      <TabsList className="grid grid-cols-2 mb-4 bg-gray-100">
                        <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                          <Package size={16} className="mr-2" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger value="incidents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                          <History size={16} className="mr-2" />
                          Support History
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="orders" className="space-y-3 mt-0">
                        {user.orders.length > 0 ? (
                          user.orders.map(order => (
                            <div key={order.orderId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">{order.productName}</span>
                                <Badge className={`${getStatusColor(order.status)} border`}>{order.status}</Badge>
                              </div>
                              <div className="flex items-center mt-2 text-xs text-gray-600">
                                <Package size={14} className="mr-2 text-blue-600" />
                                <span className="mr-2">{order.orderId}</span>
                                <span className="text-gray-400">•</span>
                                <Calendar size={14} className="mx-2 text-blue-600" />
                                <span>
                                  {/* From */}
                                   {order.inServiceDate} 
                                  {order.outServiceDate ? ` to ${order.outServiceDate}` : ""}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center">
                            <Package size={24} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500">No orders found</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="incidents" className="space-y-3 mt-0">
                        {user.incidents.length > 0 ? (
                          user.incidents.map(incident => (
                            <div key={incident.incidentId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800 truncate" title={incident.description}>
                                  {incident.description.length > 40 
                                    ? incident.description.substring(0, 40) + '...' 
                                    : incident.description}
                                </span>
                                <Badge className={`${getStatusColor(incident.status)} border whitespace-nowrap ml-2`}>{incident.status}</Badge>
                              </div>
                              <div className="flex items-center mt-2 text-xs text-gray-600">
                                <History size={14} className="mr-2 text-blue-600" />
                                <span className="mr-2">{incident.incidentId}</span>
                                <span className="text-gray-400">•</span>
                                <Calendar size={14} className="mx-2 text-blue-600" />
                                <span>{incident.date}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center">
                            <History size={24} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500">No support incidents found</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : selectedUser ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600">Failed to load user details</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                    <UserCircle2 size={32} className="mx-auto mb-2 text-blue-600" />
                    <p className="text-blue-700">Select a user to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="w-full md:w-2/3 pl-2">
            {selectedUser ? (
              <ChatWindow userId={selectedUser} />
            ) : (
              <Card className="h-full flex items-center justify-center p-8 shadow-lg rounded-xl border-gray-200">
                <div className="text-center p-6">
                  <div className="bg-blue-100 p-6 rounded-full inline-flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Customer Care Bot</h2>
                  <p className="text-gray-500 max-w-md">Select a customer from the sidebar to start a conversation and provide assistance.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}