/**
 * Data Verification Script
 * 
 * This script validates that our policeDataService.ts exactly matches 
 * the subdivision_list.txt file structure
 */

import { 
  apPoliceStructure,
  districtSDPOData,
  getAllDistricts,
  getTotalSDPOCount,
  getRangeForDistrict,
  getSDPOsForDistrict
} from '../services/policeDataService';

// Expected data structure from subdivision_list.txt
const expectedStructure: { [key: string]: { [key: string]: string[] } } = {
  'Visakhapatnam Range': {
    'Srikakulam': ['Srikakulam', 'Tekkali', 'Kasibugga'],
    'Vizianagaram': ['Vizianagaram', 'Bobbili', 'Cheepurupalli'],
    'PVP Manyam': ['Parvathipuram', 'PalaKonda'],
    'Alluri Seetha Rama Raju': ['Paderu', 'Chitapalli', 'Rampachodavaram', 'Chinturu'],
    'Anakapalli': ['Narasapuram', 'Anakapalli', 'Parawada']
  },
  'Eluru Range': {
    'Kakinada': ['Kakinada', 'Peddapuram'],
    'Dr. B.R. Ambedkar Konaseema': ['Amalapuram', 'Kotha Peta', 'Ramachandrapuram'],
    'East Godavari': ['DSP South Zone', 'East Zone', 'Central Zone', 'Kovvuru Sub Zone', 'North Zone'],
    'West Godavari': ['Narsapuram', 'Bhimavaram', 'Tadepalligudem'],
    'Eluru': ['Eluru', 'JR Gudem', 'Polavaram', 'Nuzvidu'],
    'Krishna': ['Bandar', 'Gudivada', 'Gannavaram', 'Avanigadda']
  },
  'Guntur Range': {
    'Guntur': ['GNT East', 'GNT West', 'GNT North', 'GNT South', 'Thulluru', 'Tenali'],
    'Palnadu': ['Sattenapalli', 'Narasaraopet', 'Gurazala'],
    'Bapatla': ['Repalle', 'Chirala', 'Bapatla'],
    'Prakasam': ['Ongole', 'Darsi', 'Markapur', 'Kanigiri'], // ✅ CORRECTED: Kandukur removed
    'Nellore': ['Nellore Town', 'Nellore Rural', 'Kavali', 'Atmakur', 'Kandukur'] // ✅ CORRECTED: Kandukur belongs here
  },
  'Kurnool Range': {
    'Kurnool': ['Kurnool', 'Yemmiganur', 'Adoni', 'Pathikonda'],
    'Nandyal': ['Nandyal', 'Allagadda', 'Dhone', 'Atmakur'],
    'YSR Kadapa': ['Kadapa', 'Pulivendula', 'Proddatur', 'Mydukur', 'Jammalamadugu'],
    'Annamayya': ['Rajampet', 'Rayachoty', 'Madanapalli']
  },
  'Ananthapuramu Range': {
    'Ananthapuramu': ['Anantapur Urban', 'Anantapur Rural', 'Guntakal', 'Kalyanadurgam', 'Tadipatri'],
    'Sri Satya Sai': ['Dharmavaram', 'Kadiri', 'Penukonda', 'Puttaparthi', 'Hindupur'],
    'Chittoor': ['Chittoor', 'Palamaner', 'Nagari', 'Kuppam'],
    'Tirupati': ['Tirupati', 'Chandragiri', 'Renigunta', 'Srikalahasti', 'Puttur', 'Gudur', 'Naidupeta']
  },
  'Commissionerates': {
    'Visakhapatnam City': ['Visakha East', 'Dwaraka', 'Visakha North', 'Visakha Harbour', 'Visakha South', 'Visakha West'],
    'Vijayawada City': ['Vijayawada West', 'Vijayawada Central', 'Vijayawada North', 'Vijayawada South', 'Tiruvuru', 'Nandigama']
  }
};

/**
 * Verify district structure
 */
export const verifyDistrictStructure = () => {
  console.log('🔍 Verifying District Structure Against subdivision_list.txt...\n');
  
  let totalErrors = 0;
  let totalChecks = 0;
  
  // Check each range
  Object.keys(expectedStructure).forEach(rangeName => {
    if (rangeName === 'Commissionerates') return; // Handle separately
    
    console.log(`📍 Checking ${rangeName}:`);
    const expectedDistricts = Object.keys(expectedStructure[rangeName] as { [key: string]: string[] });
    const actualDistricts = apPoliceStructure.ranges[rangeName]?.districts || [];
    
    // Check if all expected districts are present
    expectedDistricts.forEach(district => {
      totalChecks++;
      if (actualDistricts.includes(district)) {
        console.log(`  ✅ ${district} - Present`);
      } else {
        console.log(`  ❌ ${district} - MISSING`);
        totalErrors++;
      }
    });
    
    // Check for extra districts
    actualDistricts.forEach(district => {
      if (!expectedDistricts.includes(district)) {
        console.log(`  ⚠️  ${district} - EXTRA (not in subdivision_list.txt)`);
        totalErrors++;
      }
    });
    
    console.log('');
  });
  
  // Check commissionerates
  console.log('📍 Checking Commissionerates:');
  const expectedCommissionerates = Object.keys(expectedStructure['Commissionerates']);
  expectedCommissionerates.forEach(commissionerate => {
    totalChecks++;
    if (apPoliceStructure.commissionerates.includes(commissionerate)) {
      console.log(`  ✅ ${commissionerate} - Present`);
    } else {
      console.log(`  ❌ ${commissionerate} - MISSING`);
      totalErrors++;
    }
  });
  
  console.log(`\n📊 District Structure Check: ${totalChecks - totalErrors}/${totalChecks} passed\n`);
  return totalErrors === 0;
};

/**
 * Verify SDPO subdivision data
 */
export const verifySDPOData = () => {
  console.log('🔍 Verifying SDPO Subdivision Data...\n');
  
  let totalErrors = 0;
  let totalSDPOs = 0;
  
  // Check each range's districts
  Object.keys(expectedStructure).forEach(rangeName => {
    if (rangeName === 'Commissionerates') {
      // Handle commissionerates
      Object.keys(expectedStructure[rangeName] as { [key: string]: string[] }).forEach(commissionerate => {
        const expectedSDPOs = (expectedStructure[rangeName] as { [key: string]: string[] })[commissionerate];
        const actualSDPOs = getSDPOsForDistrict(commissionerate).map(s => s.jurisdiction);
        
        console.log(`🏙️ ${commissionerate}:`);
        console.log(`   Expected: ${expectedSDPOs.length} SDPOs`);
        console.log(`   Actual: ${actualSDPOs.length} SDPOs`);
        
        expectedSDPOs.forEach((expectedSDPO: string) => {
          totalSDPOs++;
          if (actualSDPOs.includes(expectedSDPO)) {
            console.log(`   ✅ ${expectedSDPO}`);
          } else {
            console.log(`   ❌ ${expectedSDPO} - MISSING`);
            totalErrors++;
          }
        });
        
        // Check for extra SDPOs
        actualSDPOs.forEach(actualSDPO => {
          if (!expectedSDPOs.includes(actualSDPO)) {
            console.log(`   ⚠️  ${actualSDPO} - EXTRA`);
            totalErrors++;
          }
        });
        console.log('');
      });
    } else {
      // Handle regular ranges
      Object.keys(expectedStructure[rangeName] as { [key: string]: string[] }).forEach(district => {
        const expectedSDPOs = (expectedStructure[rangeName] as { [key: string]: string[] })[district];
        const actualSDPOs = getSDPOsForDistrict(district).map(s => s.jurisdiction);
        
        console.log(`📍 ${district} (${rangeName}):`);
        console.log(`   Expected: ${expectedSDPOs.length} SDPOs`);
        console.log(`   Actual: ${actualSDPOs.length} SDPOs`);
        
        expectedSDPOs.forEach((expectedSDPO: string) => {
          totalSDPOs++;
          if (actualSDPOs.includes(expectedSDPO)) {
            console.log(`   ✅ ${expectedSDPO}`);
          } else {
            console.log(`   ❌ ${expectedSDPO} - MISSING`);
            totalErrors++;
          }
        });
        
        // Check for extra SDPOs
        actualSDPOs.forEach(actualSDPO => {
          if (!expectedSDPOs.includes(actualSDPO)) {
            console.log(`   ⚠️  ${actualSDPO} - EXTRA`);
            totalErrors++;
          }
        });
        console.log('');
      });
    }
  });
  
  console.log(`📊 SDPO Data Check: ${totalSDPOs - totalErrors}/${totalSDPOs} SDPOs correct`);
  console.log(`📈 Total SDPOs in system: ${getTotalSDPOCount()}\n`);
  
  return totalErrors === 0;
};

/**
 * Key corrections made based on subdivision_list.txt
 */
export const reportCorrections = () => {
  console.log('🔧 KEY CORRECTIONS MADE:\n');
  
  console.log('❌ PRAKASAM District - BEFORE (INCORRECT):');
  console.log('   Ongole, Chirala, Kandukur, Markapur');
  console.log('✅ PRAKASAM District - AFTER (CORRECTED):');
  console.log('   Ongole, Darsi, Markapur, Kanigiri');
  console.log('   🎯 Kandukur moved to NELLORE (where it belongs)\n');
  
  console.log('✅ NELLORE District - CORRECTED:');
  console.log('   Nellore Town, Nellore Rural, Kavali, Atmakur, Kandukur');
  console.log('   🎯 Now includes Kandukur as per subdivision_list.txt\n');
  
  console.log('🔄 Other corrections:');
  console.log('   • Visakhapatnam district removed (not in subdivision_list.txt)');
  console.log('   • Anakapalli district added (was missing)');
  console.log('   • All SDPO names updated to exact subdivision_list.txt names');
  console.log('   • Tirupathi → Tirupati (spelling correction)');
  console.log('   • All ranges restructured to match official organization\n');
};

/**
 * Verify specific issue mentioned by user
 */
export const verifyKandukurIssue = () => {
  console.log('🎯 VERIFYING KANDUKUR ISSUE:\n');
  
  // Check Prakasam district
  const praksamSDPOs = getSDPOsForDistrict('Prakasam').map(s => s.jurisdiction);
  console.log('📍 PRAKASAM District SDPOs:');
  console.log(`   ${praksamSDPOs.join(', ')}`);
  console.log(`   ✅ Kandukur is ${praksamSDPOs.includes('Kandukur') ? 'PRESENT' : 'NOT PRESENT'} (should be NOT PRESENT)`);
  console.log('');
  
  // Check Nellore district
  const nelloreSDPOs = getSDPOsForDistrict('Nellore').map(s => s.jurisdiction);
  console.log('📍 NELLORE District SDPOs:');
  console.log(`   ${nelloreSDPOs.join(', ')}`);
  console.log(`   ✅ Kandukur is ${nelloreSDPOs.includes('Kandukur') ? 'PRESENT' : 'NOT PRESENT'} (should be PRESENT)`);
  console.log('');
  
  const kandukurCorrect = !praksamSDPOs.includes('Kandukur') && nelloreSDPOs.includes('Kandukur');
  console.log(`🎯 KANDUKUR PLACEMENT: ${kandukurCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
  console.log('   Kandukur now belongs to NELLORE, not PRAKASAM\n');
  
  return kandukurCorrect;
};

/**
 * Run complete verification
 */
export const runCompleteVerification = () => {
  console.log('🚀 COMPLETE DATA VERIFICATION - subdivision_list.txt Compliance\n');
  console.log('='.repeat(70));
  
  reportCorrections();
  console.log('='.repeat(70));
  
  const districtStructureOK = verifyDistrictStructure();
  console.log('='.repeat(70));
  
  const sdpoDataOK = verifySDPOData();
  console.log('='.repeat(70));
  
  const kandukurOK = verifyKandukurIssue();
  console.log('='.repeat(70));
  
  const allCorrect = districtStructureOK && sdpoDataOK && kandukurOK;
  
  console.log('📋 FINAL VERIFICATION SUMMARY:');
  console.log(`   District Structure: ${districtStructureOK ? '✅ CORRECT' : '❌ ERRORS FOUND'}`);
  console.log(`   SDPO Data: ${sdpoDataOK ? '✅ CORRECT' : '❌ ERRORS FOUND'}`);
  console.log(`   Kandukur Issue: ${kandukurOK ? '✅ FIXED' : '❌ NOT FIXED'}`);
  console.log(`   Overall Status: ${allCorrect ? '✅ ALL CORRECT' : '❌ ISSUES FOUND'}`);
  console.log('');
  
  if (allCorrect) {
    console.log('🎉 SUCCESS: All data exactly matches subdivision_list.txt!');
    console.log('🎯 The project now strictly commits to official AP Police structure.');
  } else {
    console.log('⚠️  WARNING: Data discrepancies found. Please review and correct.');
  }
  
  return allCorrect;
};

// Export for browser console use
if (typeof window !== 'undefined') {
  (window as any).dataVerification = {
    verifyDistrictStructure,
    verifySDPOData,
    verifyKandukurIssue,
    runCompleteVerification,
    reportCorrections
  };
}
