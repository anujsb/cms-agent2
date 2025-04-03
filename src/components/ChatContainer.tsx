// // app/components/ChatContainer.tsx
// "use client";

// import { useState } from "react";
// import UserSelector from "./UserSelector";
// import ChatWindow from "./ChatWindow";

// interface ChatContainerProps {
//   initialUserId: string;
// }

// export default function ChatContainer({ initialUserId }: ChatContainerProps) {
//   const [selectedUserId, setSelectedUserId] = useState(initialUserId);

//   return (
//     <div>
//       <UserSelector onUserChange={setSelectedUserId} />
//       <ChatWindow userId={selectedUserId} />
//     </div>
//   );
// }