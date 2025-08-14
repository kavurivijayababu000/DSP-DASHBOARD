/**
 * Police Data Service
 * 
 * This service provides centralized access to AP Police organizational data
 * and utility functions for jurisdiction management. It's designed to be
 * reusable across the entire application.
 */

export interface SDPOLocation {
  jurisdiction: string;
  range: string;
}

export interface PoliceStructure {
  ranges: {
    [rangeName: string]: {
      districts: string[];
    };
  };
  commissionerates: string[];
}

export interface DistrictSDPOData {
  [district: string]: SDPOLocation[];
}

// Complete AP Police organizational structure based on subdivision_list.txt (CORRECTED)
export const apPoliceStructure: PoliceStructure = {
  ranges: {
    'Visakhapatnam Range': {
      districts: ['Srikakulam', 'Vizianagaram', 'PVP Manyam', 'Alluri Seetha Rama Raju', 'Anakapalli']
    },
    'Eluru Range': {
      districts: ['Kakinada', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'West Godavari', 'Eluru', 'Krishna']
    },
    'Guntur Range': {
      districts: ['Guntur', 'Palnadu', 'Bapatla', 'Prakasam', 'Nellore']
    },
    'Kurnool Range': {
      districts: ['Kurnool', 'Nandyal', 'YSR Kadapa', 'Annamayya']
    },
    'Ananthapuramu Range': {
      districts: ['Ananthapuramu', 'Sri Satya Sai', 'Chittoor', 'Tirupati']
    }
  },
  commissionerates: ['Visakhapatnam City', 'Vijayawada City']
};

// Complete SDPO subdivision data for all districts and commissionerates (CORRECTED from subdivision_list.txt)
export const districtSDPOData: DistrictSDPOData = {
  // VISAKHAPATNAM RANGE
  'Srikakulam': [
    { jurisdiction: 'Srikakulam', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Tekkali', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Kasibugga', range: 'Visakhapatnam Range' }
  ],
  'Vizianagaram': [
    { jurisdiction: 'Vizianagaram', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Bobbili', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Cheepurupalli', range: 'Visakhapatnam Range' }
  ],
  'PVP Manyam': [
    { jurisdiction: 'Parvathipuram', range: 'Visakhapatnam Range' },
    { jurisdiction: 'PalaKonda', range: 'Visakhapatnam Range' }
  ],
  'Alluri Seetha Rama Raju': [
    { jurisdiction: 'Paderu', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Chitapalli', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Rampachodavaram', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Chinturu', range: 'Visakhapatnam Range' }
  ],
  'Anakapalli': [
    { jurisdiction: 'Narasapuram', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Anakapalli', range: 'Visakhapatnam Range' },
    { jurisdiction: 'Parawada', range: 'Visakhapatnam Range' }
  ],

  // ELURU RANGE
  'Kakinada': [
    { jurisdiction: 'Kakinada', range: 'Eluru Range' },
    { jurisdiction: 'Peddapuram', range: 'Eluru Range' }
  ],
  'Dr. B.R. Ambedkar Konaseema': [
    { jurisdiction: 'Amalapuram', range: 'Eluru Range' },
    { jurisdiction: 'Kotha Peta', range: 'Eluru Range' },
    { jurisdiction: 'Ramachandrapuram', range: 'Eluru Range' }
  ],
  'East Godavari': [
    { jurisdiction: 'DSP South Zone', range: 'Eluru Range' },
    { jurisdiction: 'East Zone', range: 'Eluru Range' },
    { jurisdiction: 'Central Zone', range: 'Eluru Range' },
    { jurisdiction: 'Kovvuru Sub Zone', range: 'Eluru Range' },
    { jurisdiction: 'North Zone', range: 'Eluru Range' }
  ],
  'West Godavari': [
    { jurisdiction: 'Narsapuram', range: 'Eluru Range' },
    { jurisdiction: 'Bhimavaram', range: 'Eluru Range' },
    { jurisdiction: 'Tadepalligudem', range: 'Eluru Range' }
  ],
  'Eluru': [
    { jurisdiction: 'Eluru', range: 'Eluru Range' },
    { jurisdiction: 'JR Gudem', range: 'Eluru Range' },
    { jurisdiction: 'Polavaram', range: 'Eluru Range' },
    { jurisdiction: 'Nuzvidu', range: 'Eluru Range' }
  ],
  'Krishna': [
    { jurisdiction: 'Bandar', range: 'Eluru Range' },
    { jurisdiction: 'Gudivada', range: 'Eluru Range' },
    { jurisdiction: 'Gannavaram', range: 'Eluru Range' },
    { jurisdiction: 'Avanigadda', range: 'Eluru Range' }
  ],

  // GUNTUR RANGE
  'Guntur': [
    { jurisdiction: 'GNT East', range: 'Guntur Range' },
    { jurisdiction: 'GNT West', range: 'Guntur Range' },
    { jurisdiction: 'GNT North', range: 'Guntur Range' },
    { jurisdiction: 'GNT South', range: 'Guntur Range' },
    { jurisdiction: 'Thulluru', range: 'Guntur Range' },
    { jurisdiction: 'Tenali', range: 'Guntur Range' }
  ],
  'Palnadu': [
    { jurisdiction: 'Sattenapalli', range: 'Guntur Range' },
    { jurisdiction: 'Narasaraopet', range: 'Guntur Range' },
    { jurisdiction: 'Gurazala', range: 'Guntur Range' }
  ],
  'Bapatla': [
    { jurisdiction: 'Repalle', range: 'Guntur Range' },
    { jurisdiction: 'Chirala', range: 'Guntur Range' },
    { jurisdiction: 'Bapatla', range: 'Guntur Range' }
  ],
  'Prakasam': [
    { jurisdiction: 'Ongole', range: 'Guntur Range' },
    { jurisdiction: 'Darsi', range: 'Guntur Range' },
    { jurisdiction: 'Markapur', range: 'Guntur Range' },
    { jurisdiction: 'Kanigiri', range: 'Guntur Range' }
  ],
  'Nellore': [
    { jurisdiction: 'Nellore Town', range: 'Guntur Range' },
    { jurisdiction: 'Nellore Rural', range: 'Guntur Range' },
    { jurisdiction: 'Kavali', range: 'Guntur Range' },
    { jurisdiction: 'Atmakur', range: 'Guntur Range' },
    { jurisdiction: 'Kandukur', range: 'Guntur Range' }
  ],

  // KURNOOL RANGE
  'Kurnool': [
    { jurisdiction: 'Kurnool', range: 'Kurnool Range' },
    { jurisdiction: 'Yemmiganur', range: 'Kurnool Range' },
    { jurisdiction: 'Adoni', range: 'Kurnool Range' },
    { jurisdiction: 'Pathikonda', range: 'Kurnool Range' }
  ],
  'Nandyal': [
    { jurisdiction: 'Nandyal', range: 'Kurnool Range' },
    { jurisdiction: 'Allagadda', range: 'Kurnool Range' },
    { jurisdiction: 'Dhone', range: 'Kurnool Range' },
    { jurisdiction: 'Atmakur', range: 'Kurnool Range' }
  ],
  'YSR Kadapa': [
    { jurisdiction: 'Kadapa', range: 'Kurnool Range' },
    { jurisdiction: 'Pulivendula', range: 'Kurnool Range' },
    { jurisdiction: 'Proddatur', range: 'Kurnool Range' },
    { jurisdiction: 'Mydukur', range: 'Kurnool Range' },
    { jurisdiction: 'Jammalamadugu', range: 'Kurnool Range' }
  ],
  'Annamayya': [
    { jurisdiction: 'Rajampet', range: 'Kurnool Range' },
    { jurisdiction: 'Rayachoty', range: 'Kurnool Range' },
    { jurisdiction: 'Madanapalli', range: 'Kurnool Range' }
  ],

  // ANANTHAPURAMU RANGE
  'Ananthapuramu': [
    { jurisdiction: 'Anantapur Urban', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Anantapur Rural', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Guntakal', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Kalyanadurgam', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Tadipatri', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Tirupathi L&O', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Sricity', range: 'Ananthapuramu Range' }
  ],
  'Sri Satya Sai': [
    { jurisdiction: 'Dharmavaram', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Kadiri', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Penukonda', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Puttaparthi', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Hindupur', range: 'Ananthapuramu Range' }
  ],
  'Chittoor': [
    { jurisdiction: 'Chittoor', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Palamaner', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Nagari', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Kuppam', range: 'Ananthapuramu Range' }
  ],
  'Tirupati': [
    { jurisdiction: 'Tirupati', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Chandragiri', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Renigunta', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Srikalahasti', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Puttur', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Gudur', range: 'Ananthapuramu Range' },
    { jurisdiction: 'Naidupeta', range: 'Ananthapuramu Range' }
  ],

  // COMMISSIONERATES
  'Visakhapatnam City': [
    { jurisdiction: 'Visakha East', range: 'Visakhapatnam City Commissionerate' },
    { jurisdiction: 'Dwaraka', range: 'Visakhapatnam City Commissionerate' },
    { jurisdiction: 'Visakha North', range: 'Visakhapatnam City Commissionerate' },
    { jurisdiction: 'Visakha Harbour', range: 'Visakhapatnam City Commissionerate' },
    { jurisdiction: 'Visakha South', range: 'Visakhapatnam City Commissionerate' },
    { jurisdiction: 'Visakha West', range: 'Visakhapatnam City Commissionerate' }
  ],
  'Vijayawada City': [
    { jurisdiction: 'Vijayawada West', range: 'Vijayawada City Commissionerate' },
    { jurisdiction: 'Vijayawada Central', range: 'Vijayawada City Commissionerate' },
    { jurisdiction: 'Vijayawada North', range: 'Vijayawada City Commissionerate' },
    { jurisdiction: 'Vijayawada South', range: 'Vijayawada City Commissionerate' },
    { jurisdiction: 'Tiruvuru', range: 'Vijayawada City Commissionerate' },
    { jurisdiction: 'Nandigama', range: 'Vijayawada City Commissionerate' }
  ]
};

/**
 * Get all districts in the AP Police structure
 */
export const getAllDistricts = (): string[] => {
  const districts: string[] = [];
  
  // Add range districts
  Object.values(apPoliceStructure.ranges).forEach(range => {
    districts.push(...range.districts);
  });
  
  // Add commissionerates
  districts.push(...apPoliceStructure.commissionerates);
  
  return districts.sort();
};

/**
 * Get all ranges in the AP Police structure
 */
export const getAllRanges = (): string[] => {
  const ranges = Object.keys(apPoliceStructure.ranges);
  const commissionerateRanges = apPoliceStructure.commissionerates.map(c => `${c} Commissionerate`);
  return [...ranges, ...commissionerateRanges].sort();
};

/**
 * Get only the actual ranges (not commissionerates) - for DIG management
 */
export const getActualRanges = (): string[] => {
  return Object.keys(apPoliceStructure.ranges).sort();
};

/**
 * Get the range for a given district
 */
export const getRangeForDistrict = (district: string): string => {
  // Check regular ranges
  for (const [rangeName, rangeData] of Object.entries(apPoliceStructure.ranges)) {
    if (rangeData.districts.includes(district)) {
      return rangeName;
    }
  }
  
  // Check commissionerates
  if (apPoliceStructure.commissionerates.includes(district)) {
    return `${district} Commissionerate`;
  }
  
  return 'Unknown Range';
};

/**
 * Get districts in a specific range
 */
export const getDistrictsInRange = (rangeName: string): string[] => {
  if (rangeName.includes('Commissionerate')) {
    const commissionerateName = rangeName.replace(' Commissionerate', '');
    return apPoliceStructure.commissionerates.includes(commissionerateName) ? [commissionerateName] : [];
  }
  
  return apPoliceStructure.ranges[rangeName]?.districts || [];
};

/**
 * Get SDPO data for a specific district
 */
export const getSDPOsForDistrict = (district: string): SDPOLocation[] => {
  return districtSDPOData[district] || [];
};

/**
 * Resolve user jurisdiction to district name
 * Handles various formats and mappings
 */
export const resolveUserJurisdictionToDistrict = (userJurisdiction: string, userRole: 'SP' | 'CP'): string => {
  if (!userJurisdiction) return 'Guntur'; // Default fallback

  // Clean up the jurisdiction string
  let cleanedJurisdiction = userJurisdiction
    .replace(/\s+(District|Commissionerate|City)\s*$/i, '')
    .trim();

  if (userRole === 'SP') {
    // Special mapping for SP districts based on subdivision_list.txt
    const spDistrictMapping: { [key: string]: string } = {
      // Visakhapatnam Range
      'Srikakulam': 'Srikakulam',
      'Vizianagaram': 'Vizianagaram',
      'PVP Manyam': 'PVP Manyam',
      'Alluri Seetha Rama Raju': 'Alluri Seetha Rama Raju',
      'Anakapalli': 'Anakapalli',
      
      // Eluru Range
      'Kakinada': 'Kakinada',
      'Dr. B.R. Ambedkar Konaseema': 'Dr. B.R. Ambedkar Konaseema',
      'East Godavari': 'East Godavari',
      'West Godavari': 'West Godavari',
      'Eluru': 'Eluru',
      'Krishna': 'Krishna',
      
      // Guntur Range
      'Guntur': 'Guntur',
      'Palnadu': 'Palnadu',
      'Bapatla': 'Bapatla',
      'Prakasam': 'Prakasam',
      'Nellore': 'Nellore',
      
      // Kurnool Range
      'Kurnool': 'Kurnool',
      'Nandyal': 'Nandyal',
      'YSR Kadapa': 'YSR Kadapa',
      'Kadapa': 'YSR Kadapa', // Alternative name
      'Annamayya': 'Annamayya',
      
      // Ananthapuramu Range
      'Ananthapuramu': 'Ananthapuramu',
      'Anantapur': 'Ananthapuramu', // Alternative name
      'Sri Satya Sai': 'Sri Satya Sai',
      'Chittoor': 'Chittoor',
      'Tirupati': 'Tirupati',
      'Tirupathi': 'Tirupati' // Alternative spelling
    };

    // Try exact match first
    if (spDistrictMapping[cleanedJurisdiction]) {
      return spDistrictMapping[cleanedJurisdiction];
    }

    // Try partial match for complex names
    for (const [key, value] of Object.entries(spDistrictMapping)) {
      if (cleanedJurisdiction.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(cleanedJurisdiction.toLowerCase())) {
        return value;
      }
    }

    // Check if it exists directly in our district data
    if (districtSDPOData[cleanedJurisdiction]) {
      return cleanedJurisdiction;
    }

  } else if (userRole === 'CP') {
    // Handle Commissioner jurisdictions
    if (cleanedJurisdiction.toLowerCase().includes('visakhapatnam') || 
        cleanedJurisdiction.toLowerCase().includes('vizag')) {
      return 'Visakhapatnam City';
    } else if (cleanedJurisdiction.toLowerCase().includes('vijayawada')) {
      return 'Vijayawada City';
    }
  }

  // Final fallback - try to find any district that contains the jurisdiction string
  const allDistricts = getAllDistricts();
  const matchedDistrict = allDistricts.find(district => 
    district.toLowerCase().includes(cleanedJurisdiction.toLowerCase()) ||
    cleanedJurisdiction.toLowerCase().includes(district.toLowerCase())
  );

  return matchedDistrict || 'Guntur'; // Ultimate fallback
};

/**
 * Generate all districts with their SDPO counts for overview
 */
export const getDistrictOverview = () => {
  return Object.keys(districtSDPOData).map(district => ({
    district,
    range: getRangeForDistrict(district),
    sdpoCount: districtSDPOData[district].length,
    sdpos: districtSDPOData[district]
  }));
};

/**
 * Validate if a district exists in our data
 */
export const isValidDistrict = (district: string): boolean => {
  return district in districtSDPOData;
};

/**
 * Get total SDPO count across all districts
 */
export const getTotalSDPOCount = (): number => {
  return Object.values(districtSDPOData).reduce((total, sdpos) => total + sdpos.length, 0);
};
