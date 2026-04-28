import ChatBot from '@/components/ui/ChatBot';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}