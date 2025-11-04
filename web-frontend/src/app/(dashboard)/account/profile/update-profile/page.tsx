'use client';

import React, { useEffect , useState } from 'react';


export default function UpdateProfilePage() {
   const [userData, setUserData] = useState(null);

   useEffect(() => {
       // Fetch user data from API or context
       const fetchUserData = async () => {
           const data = await getUserData();
           setUserData(data);
       };

       fetchUserData();
   }, []);

   if (!userData) {
       return <div>Loading...</div>;
   }

   return (
       <div>
           <h1>Update Profile</h1>
           {/* Render form with userData */}
       </div>
   );
}
