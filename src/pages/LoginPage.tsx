import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'DGP' | 'DIG' | 'SP' | 'CP' | 'SDPO'>('SDPO');
  const [selectedDistrict, setSelectedDistrict] = useState('Guntur');
  const [selectedSubdivision, setSelectedSubdivision] = useState('');
  const dispatch = useDispatch();

  // Update selected district when role changes
  const handleRoleChange = (newRole: typeof selectedRole) => {
    setSelectedRole(newRole);
    if (newRole === 'CP') {
      setSelectedDistrict('Visakhapatnam City');
    } else {
      setSelectedDistrict('Guntur');
    }
    setSelectedSubdivision(''); // Reset subdivision when role changes
  };

  // District-wise SDPO subdivision mapping
  const districtSubdivisions: { [key: string]: string[] } = {
    'Guntur': ['GNT East', 'GNT West', 'GNT North', 'GNT South', 'Thulluru', 'Tenali'],
    'Srikakulam': ['Srikakulam', 'Tekkali', 'Kasibugga'],
    'Vizianagaram': ['Vizianagaram', 'Bobbili', 'Cheepurupalli'],
    'PVP Manyam': ['Parvathipuram', 'PalaKonda'],
    'Alluri Seetha Rama Raju': ['Paderu', 'Chitapalli', 'Rampachodavaram', 'Chinturu'],
    'Anakapalli': ['Narasapuram', 'Anakapalli', 'Parawada'],
    'Kakinada': ['Kakinada', 'Peddapuram'],
    'Dr. B.R. Ambedkar Konaseema': ['Amalapuram', 'Kotha Peta', 'Ramachandrapuram'],
    'East Godavari': ['DSP South Zone', 'East Zone', 'Central Zone', 'Kovvuru Sub Zone', 'North Zone'],
    'West Godavari': ['Narsapuram', 'Bhimavaram', 'Tadepalligudem'],
    'Eluru': ['Eluru', 'JR Gudem', 'Polavaram', 'Nuzvidu'],
    'Krishna': ['Bandar', 'Gudivada', 'Gannavaram', 'Avanigadda'],
    'Palnadu': ['Sattenapalli', 'Narasaraopet', 'Gurazala'],
    'Bapatla': ['Repalle', 'Chirala', 'Bapatla'],
    'Prakasam': ['Ongole', 'Darsi', 'Markapur', 'Kanigiri'],
    'Nellore': ['Nellore Town', 'Nellore Rural', 'Kavali', 'Atmakur', 'Kandukur'],
    'Kurnool': ['Kurnool', 'Yemmiganur', 'Adoni', 'Pathikonda'],
    'Nandyal': ['Nandyal', 'Allagadda', 'Dhone', 'Atmakur'],
    'YSR Kadapa': ['Kadapa', 'Pulivendula', 'Proddatur', 'Mydukur', 'Jammalamadugu'],
    'Annamayya': ['Rajampet', 'Rayachoty', 'Madanapalli'],
    'Ananthapuramu': ['Anantapur Urban', 'Anantapur Rural', 'Guntakal', 'Kalyanadurgam', 'Tadipatri'],
    'Sri Satya Sai': ['Dharmavaram', 'Kadiri', 'Penukonda', 'Puttaparthi', 'Hindupur'],
    'Chittoor': ['Chittoor', 'Palamaner', 'Nagari', 'Kuppam'],
    'Tirupati': ['Tirupati', 'Chandragiri', 'Renigunta', 'Srikalahasti', 'Puttur', 'Gudur', 'Naidupeta', 'Tirumala L&O', 'Sricity'],
    'Visakhapatnam City': ['Visakha East', 'Dwaraka', 'Visakha North', 'Visakha Harbour', 'Visakha South', 'Visakha West'],
    'Vijayawada City': ['Vijayawada West', 'Vijayawada Central', 'Vijayawada North', 'Vijayawada South', 'Tiruvuru', 'Nandigama']
  };

  // Handle district change and reset subdivision
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedSubdivision(''); // Reset subdivision when district changes
  };

  const districts = [
    'Srikakulam', 'Vizianagaram', 'PVP Manyam', 'Alluri Seetha Rama Raju', 'Anakapalli', 
    'Kakinada', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'West Godavari', 'Eluru', 
    'Krishna', 'Guntur', 'Palnadu', 'Bapatla', 'Prakasam', 'Nellore', 'Kurnool', 
    'Nandyal', 'YSR Kadapa', 'Annamayya', 'Ananthapuramu', 'Sri Satya Sai', 'Chittoor', 
    'Tirupati'
  ];

  const commissionerates = ['Visakhapatnam City', 'Vijayawada City'];

  // Combined list for SDPO users (districts + commissionerates)
  const sdpoJurisdictions = [...districts, ...commissionerates];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for SDPO role
    if (selectedRole === 'SDPO' && !selectedSubdivision) {
      const subdivisionType = commissionerates.includes(selectedDistrict) ? 'zone' : 'subdivision';
      alert(`Please select a ${subdivisionType} for SDPO login`);
      return;
    }
    
    // Mock login - in real app, this would call API
    const mockUser = {
      id: '1',
      name: selectedRole === 'DGP' ? 'DGP Harish Kumar Gupta' : 
            selectedRole === 'DIG' ? 'DIG K.V. Mohan Rao' : 
            selectedRole === 'SP' ? `SP ${selectedDistrict}` :
            selectedRole === 'CP' ? 'CP Ch. Srikanth' : 
            `SDPO ${selectedSubdivision || selectedDistrict}`,
      email,
      role: selectedRole,
      jurisdiction: selectedRole === 'DGP' ? 'Andhra Pradesh' : 
                   selectedRole === 'DIG' ? 'Visakhapatnam Range' : 
                   selectedRole === 'SP' ? `${selectedDistrict} District` :
                   selectedRole === 'CP' ? selectedDistrict : 
                   `${selectedSubdivision || selectedDistrict} SDPO`,
      permissions: ['read', 'write', 'admin'],
    };

    dispatch(loginSuccess({
      user: mockUser,
      token: 'mock-jwt-token'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ap-blue-900 to-ap-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-4xl">🛡️</div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            AP Police SDPO Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-ap-blue-200">
            Sign in to access your dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Select Role
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as typeof selectedRole)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                >
                  <option value="DGP">DGP (State Level)</option>
                  <option value="DIG">DIG (Range Level)</option>
                  <option value="SP">SP (District Level)</option>
                  <option value="CP">CP (Commissionerate)</option>
                  <option value="SDPO">SDPO (Sub-Division)</option>
                </select>
              </div>

              {selectedRole === 'SP' && (
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                    Select District
                  </label>
                  <select
                    id="district"
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                  >
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRole === 'SDPO' && (
                <div>
                  <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">
                    Select District/Commissionerate
                  </label>
                  <select
                    id="jurisdiction"
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                  >
                    {sdpoJurisdictions.map(jurisdiction => (
                      <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRole === 'SDPO' && selectedDistrict && (
                <div>
                  <label htmlFor="subdivision" className="block text-sm font-medium text-gray-700">
                    Select SDPO {commissionerates.includes(selectedDistrict) ? 'Zone' : 'Subdivision'}
                  </label>
                  <select
                    id="subdivision"
                    value={selectedSubdivision}
                    onChange={(e) => setSelectedSubdivision(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                    required
                  >
                    <option value="">-- Select {commissionerates.includes(selectedDistrict) ? 'Zone' : 'Subdivision'} --</option>
                    {districtSubdivisions[selectedDistrict]?.map(subdivision => (
                      <option key={subdivision} value={subdivision}>{subdivision}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRole === 'CP' && (
                <div>
                  <label htmlFor="commissionerate" className="block text-sm font-medium text-gray-700">
                    Select Commissionerate
                  </label>
                  <select
                    id="commissionerate"
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                  >
                    {commissionerates.map(comm => (
                      <option key={comm} value={comm}>{comm}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ap-blue-500 focus:ring-ap-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ap-blue-600 hover:bg-ap-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ap-blue-500"
              >
                Sign in
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Demo credentials: Use any email/password with the selected role
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
