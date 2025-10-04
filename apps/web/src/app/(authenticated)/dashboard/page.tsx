import { auth } from '@/auth';

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div>
      <h1 className='text-2xl font-semibold'>Dashboard</h1>
        <p>User session:</p>
        <p className='text-sm'>{JSON.stringify(session?.user)}</p>
    </div>
  );
};

export default DashboardPage;
