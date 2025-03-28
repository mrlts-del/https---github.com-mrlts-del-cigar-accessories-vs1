import { redirect } from 'next/navigation';

export default function AccountPage() {
  // Redirect base /account route to the profile page
  redirect('/account/profile');

  // Alternatively, render an overview component here
  // return (
  //   <div>
  //     <h1>Account Overview</h1>
  //     {/* ... */}
  //   </div>
  // );
}
