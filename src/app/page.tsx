import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <main 
      className="min-h-screen bg-white md:bg-transparent"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(135, 206, 235, 0.4) 0%, rgba(152, 216, 232, 0.3) 20%, rgba(182, 229, 240, 0.25) 40%, rgba(199, 236, 252, 0.3) 60%, rgba(216, 243, 255, 0.4) 80%, rgba(233, 249, 255, 0.45) 100%), url(/Sky_4k%201.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
    </main>
  );
} 