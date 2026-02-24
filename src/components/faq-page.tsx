import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HelpCircle, ChevronDown, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string | string[];
  customContent?: React.ReactNode;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

// Endorsements Reference Component
function EndorsementsReference() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newSections = new Set(openSections);
    if (newSections.has(id)) {
      newSections.delete(id);
    } else {
      newSections.add(id);
    }
    setOpenSections(newSections);
  };

  const endorsementData = [
    {
      title: "Private Pilot",
      subsections: [
        {
          name: "Before Training",
          items: [
            { 
              endorsement: "TSA Citizenship Verification", 
              code: "A.14", 
              regulation: "49 CFR §1552.15(c)", 
              notes: "Only for initial FAA pilot certificate, recreational, sport pilot, or private pilot certificate; instrument rating; or multiengine rating. Show: valid passport, original/official birth certificate, naturalization/citizenship cert. Keep a copy 5 years or endorse student and own logbook."
            }
          ]
        },
        {
          name: "Pre-Solo",
          notes: "Student must have Medical Certificate (MedXpress) and Student Pilot Certificate (IACRA)",
          items: [
            { endorsement: "Pre-Solo Aeronautical Knowledge", code: "A.3", regulation: "§61.87(b)" },
            { endorsement: "Pre-Solo Flight Training", code: "A.4", regulation: "§61.87(c)(1) and (2)" }
          ]
        },
        {
          name: "Solo (Local <25 NM)",
          items: [
            { endorsement: "Solo Flight (Initial 90 Days)", code: "A.6", regulation: "§61.87(n)" },
            { endorsement: "Solo Flight (Additional 90 Days)", code: "A.7", regulation: "§61.87(p)" },
            { endorsement: "Solo at Another Airport (<25 NM)", code: "A.8", regulation: "§61.93(b)(1)" },
            { endorsement: "Night Solo (Optional)", code: "A.5", regulation: "§61.87(o)", notes: "Within 90 days" }
          ]
        },
        {
          name: "Solo Cross-Country",
          items: [
            { endorsement: "Solo XC Authorization", code: "A.9", regulation: "§61.93(c)(1),(2)" },
            { endorsement: "Solo XC (Per Flight)", code: "A.10", regulation: "§61.93(c)(3)", notes: "Required for each XC flight" },
            { endorsement: "Repeated XC (<50 NM)", code: "A.11", regulation: "§61.93(b)(2)", notes: "Not more than 50 NM from point of departure" },
            { endorsement: "Solo in Class B (Optional)", code: "A.12", regulation: "§61.95(a)", notes: "Per airspace" },
            { endorsement: "Solo to/from Class B Airport (Optional)", code: "A.13", regulation: "§61.95(b) and §91.131(b)(1)", notes: "Per airport" }
          ]
        },
        {
          name: "Knowledge Test",
          items: [
            { endorsement: "Home Study Review", code: "A.86", regulation: "§61.35(a)(1)", notes: "See AC 61-65K Section 10" },
            { endorsement: "Knowledge Test Endorsement", code: "A.36", regulation: "§§61.35(a)(1), 61.103(d), 61.105" },
            { endorsement: "Retest After Failure", code: "A.77", regulation: "§61.49", notes: "Required if knowledge test failed" }
          ]
        },
        {
          name: "Pre-Checkride",
          notes: "Required before every practical test",
          items: [
            { endorsement: "Practical Test Prerequisites", code: "A.1", regulation: "§61.39(a)(6)(i) and (ii)" },
            { endorsement: "Review of Knowledge Test Deficiencies", code: "A.2", regulation: "§61.39(a)(6)(iii)", notes: "As required if deficiencies identified" },
            { endorsement: "Flight Proficiency", code: "A.37", regulation: "§§61.103(f), 61.107(b), 61.109", notes: "Required in addition to §61.39 endorsements (A.1 and A.2)" }
          ]
        }
      ]
    },
    {
      title: "Commercial Pilot",
      items: [
        { endorsement: "Knowledge Test", code: "A.38", regulation: "§§61.35(a)(1), 61.123(c), 61.125" },
        { endorsement: "Practical Test Prerequisites", code: "A.1", regulation: "§61.39(a)(6)(i) and (ii)", notes: "Required before every checkride" },
        { endorsement: "Review of Deficiencies", code: "A.2", regulation: "§61.39(a)(6)(iii)", notes: "As required if deficiencies identified" },
        { endorsement: "Flight Proficiency", code: "A.39", regulation: "§§61.123(e), 61.127, 61.129" },
        { endorsement: "Retest After Failure", code: "A.77", regulation: "§61.49", notes: "Required if practical test failed" }
      ]
    },
    {
      title: "Flight Instructor (CFI)",
      notes: "No endorsement required for FIA test, but FOI requires endorsement from authorized CFI. See: faa.gov/training_testing/testing/testing_matrix",
      items: [
        { endorsement: "Spin Training", code: "A.49", regulation: "§61.183(i)(1)" },
        { endorsement: "FOI Knowledge Test", code: "A.45", regulation: "§61.183(d)", notes: "Must be endorsed by authorized (2-year) CFI" },
        { endorsement: "FIA Knowledge Test", code: "A.46", regulation: "§61.183(f)", notes: "No endorsement required prior to test" },
        { endorsement: "Practical Test Prerequisites", code: "A.1", regulation: "§61.39(a)(6)(i) and (ii)", notes: "Required before every checkride" },
        { endorsement: "Review of Deficiencies", code: "A.2", regulation: "§61.39(a)(6)(iii)", notes: "As required if deficiencies identified" },
        { endorsement: "Ground & Flight Proficiency", code: "A.47", regulation: "§61.183(g)" },
        { endorsement: "Retest After Failure", code: "A.77", regulation: "§61.49", notes: "Required if practical test failed" }
      ]
    },
    {
      title: "Added Category / Class",
      notes: "Knowledge test usually not required if you hold an airplane, powered-lift, rotorcraft, PPC, weight-shift-control aircraft, or airship rating at or above the pilot certificate level sought (AC 61-65K 33.1). Added Category requires training and aeronautical experience per 14 CFR part 61 (AC 61-65K 33.1.1). Added Class requires competency in knowledge areas and proficiency in Areas of Operation (AC 61-65K 33.1.2).",
      items: [
        { endorsement: "Solo Without Category/Class Rating", code: "A.76", regulation: "§61.31(d)(2)", notes: "For solo operations" },
        { endorsement: "Practical Test Prerequisites", code: "A.1", regulation: "§61.39(a)(6)(i) and (ii)", notes: "Required before every checkride" },
        { endorsement: "Review of Deficiencies", code: "A.2", regulation: "§61.39(a)(6)(iii)", notes: "Probably not required in most cases" },
        { endorsement: "Additional Category/Class Rating", code: "A.78", regulation: "§61.63(b) or (c)", notes: "Other than ATP" },
        { endorsement: "Retest After Failure", code: "A.77", regulation: "§61.49", notes: "Required if practical test failed" }
      ]
    },
    {
      title: "Miscellaneous Endorsements",
      items: [
        { endorsement: "Flight Review", code: "A.69", regulation: "§61.56(a) and (c)" },
        { endorsement: "Complex Airplane", code: "A.72", regulation: "§61.31(e)", notes: "To act as PIC in complex airplane" },
        { endorsement: "High Performance", code: "A.73", regulation: "§61.31(f)", notes: "To act as PIC in high-performance airplane" },
        { endorsement: "Tailwheel", code: "A.75", regulation: "§61.31(i)", notes: "To act as PIC in tailwheel airplane" },
        { endorsement: "High Altitude", code: "A.74", regulation: "§61.31(g)", notes: "To act as PIC in pressurized aircraft capable of high-altitude operations" }
      ]
    }
  ];

  return (
    <div className="mt-6 bg-white border-2 border-emerald-600 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-900 mb-2">Required Endorsements – Quick Reference</h3>
      
      {/* Important Note */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-amber-900 mb-1">IMPORTANT NOTE</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              This reference is based on <strong>AC 61-65K (or as revised)</strong>. Always reference the most current Advisory Circular for applicable endorsement information. Endorsements appear in approximately the order that they are required.
            </p>
            <p className="text-xs text-amber-700 mt-2 italic">Updated: January 2026</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {endorsementData.map((category, catIndex) => {
          const categoryId = `cat-${catIndex}`;
          const isCategoryOpen = openSections.has(categoryId);

          return (
            <div key={catIndex} className="border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(categoryId)}
                className="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-between font-bold text-left"
              >
                <span className="text-emerald-900">{category.title}</span>
                <ChevronRight
                  className={`w-5 h-5 text-emerald-600 flex-shrink-0 transition-transform ${
                    isCategoryOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="p-4 bg-gray-50">
                  {category.notes && (
                    <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-sm text-blue-900">
                      <strong>Note:</strong> {category.notes}
                    </div>
                  )}
                  
                  {category.subsections ? (
                    // Private Pilot with subsections
                    <div className="space-y-3">
                      {category.subsections.map((subsection, subIndex) => {
                        const subsectionId = `${categoryId}-sub-${subIndex}`;
                        const isSubOpen = openSections.has(subsectionId);

                        return (
                          <div key={subIndex} className="border border-gray-200 rounded">
                            <button
                              onClick={() => toggleSection(subsectionId)}
                              className="w-full px-3 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between font-semibold text-sm text-left"
                            >
                              <span className="text-gray-800">{subsection.name}</span>
                              <ChevronRight
                                className={`w-4 h-4 text-emerald-600 flex-shrink-0 transition-transform ${
                                  isSubOpen ? 'rotate-90' : ''
                                }`}
                              />
                            </button>

                            {isSubOpen && (
                              <div className="p-3">
                                {subsection.notes && (
                                  <div className="mb-3 bg-blue-50 border-l-4 border-blue-400 p-2 rounded text-xs text-blue-900">
                                    <strong>Note:</strong> {subsection.notes}
                                  </div>
                                )}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Endorsement</th>
                                        <th className="px-3 py-2 text-left font-semibold border-b border-gray-300 whitespace-nowrap">Code</th>
                                        <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Regulation</th>
                                        {subsection.items.some(item => item.notes) && (
                                          <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Notes</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subsection.items.map((item, itemIndex) => (
                                        <tr key={itemIndex} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                          <td className="px-3 py-2">{item.endorsement}</td>
                                          <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{item.code}</td>
                                          <td className="px-3 py-2 font-mono text-xs">{item.regulation}</td>
                                          {item.notes && (
                                            <td className="px-3 py-2 text-xs text-gray-700">{item.notes}</td>
                                          )}
                                          {!item.notes && subsection.items.some(i => i.notes) && (
                                            <td className="px-3 py-2"></td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Other categories with simple list
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Endorsement</th>
                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300 whitespace-nowrap">Code</th>
                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Regulation</th>
                            {category.items.some(item => item.notes) && (
                              <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Notes</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {category.items.map((item, itemIndex) => (
                            <tr key={itemIndex} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                              <td className="px-3 py-2">{item.endorsement}</td>
                              <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{item.code}</td>
                              <td className="px-3 py-2 font-mono text-xs">{item.regulation}</td>
                              {item.notes && (
                                <td className="px-3 py-2 text-xs text-gray-700">{item.notes}</td>
                              )}
                              {!item.notes && category.items.some(i => i.notes) && (
                                <td className="px-3 py-2"></td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqSections: FAQSection[] = [
    {
      title: "1. Practical Test Fee Policy",
      items: [
        {
          question: "What is the retest fee?",
          answer: "50% of the original examination fee."
        },
        {
          question: "What is the test cancellation fee?",
          answer: [
            "A $250 cancellation fee will apply if a scheduled practical test must be cancelled due to any of the following:",
            "",
            "• Missing or incomplete training documentation",
            "• Training requirements not satisfied",
            "• Pre-existing aircraft airworthiness discrepancies",
            "• Experience requirements not met",
            "• Eligibility requirements not met",
            "",
            "Applicants are strongly encouraged to verify that all documentation, endorsements, experience, and aircraft requirements are complete prior to the scheduled test date.",
            "",
            "If you have any questions regarding eligibility or required documentation, please reach out in advance. Ryan is happy to review your qualifications beforehand to help prevent avoidable cancellations due to last-minute discrepancies."
          ]
        },
        {
          question: "What methods of payment do you accept?",
          answer: "Cash (preferred) or Certified Cashier's Check. Credit cards or Personal Checks are NOT accepted."
        }
      ]
    },
    {
      title: "2. Overview of the Practical Test",
      items: [
        {
          question: "What is the scheduling process?",
          answer: "",
          customContent: (
            <div className="space-y-3">
              <p className="text-gray-800 leading-relaxed">1. Review Ryan's schedule and choose a suitable date.</p>
              <p className="text-gray-800 leading-relaxed">2. Select an available date/time and complete the booking form.</p>
              <p className="text-gray-800 leading-relaxed">3. Watch for a confirmation email; if not received within 24 hours, email Ryan to confirm.</p>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-3 my-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">⚠️ IMPORTANT</p>
                    <p className="text-sm text-amber-900 font-semibold leading-relaxed">
                      There are several scheduling factors to consider before final confirmation is provided. Please do not make any travel or logistical arrangements until you have received written confirmation via email that your practical test has been officially scheduled.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-800 leading-relaxed">4. About two weeks before your exam, Ryan will send a Practical Test Briefing with a scenario to prepare.</p>
              <p className="text-gray-800 leading-relaxed">5. Review the preparation information to ensure you're fully prepared.</p>
            </div>
          )
        },
        {
          question: "What happens if I need to cancel the night before or the morning of due to weather below my personal minimums?",
          answer: "Rescheduling due to adverse weather incurs no fee. Please notify me as soon as possible if the forecast indicates weather will be below your personal minimums, and I will make every effort to promptly secure an alternate date."
        },
        {
          question: "What is the purpose of the practical test?",
          answer: "The practical test evaluates whether you meet the FAA Airman Certification Standards (ACS) in aeronautical knowledge, risk management, and flight proficiency required for issuance of a Private Pilot Certificate."
        },
        {
          question: "What document governs how the practical test is conducted?",
          answer: "The current Private Pilot – Airplane ACS and applicable FAA regulations under 14 CFR Part 61."
        },
        {
          question: "What are the components of the practical test?",
          answer: [
            "• Oral (ground) portion",
            "• Flight portion",
            "",
            "You must successfully complete the oral portion before beginning the flight."
          ]
        },
        {
          question: "Does oral questioning end once the flight begins?",
          answer: "No. Oral questioning continues throughout the entire practical test."
        }
      ]
    },
    {
      title: "3. How the ACS Is Applied",
      items: [
        {
          question: "What three elements are evaluated in each Task?",
          answer: "Knowledge, Risk Management, and Skill."
        },
        {
          question: "Must every knowledge and risk management element be tested?",
          answer: [
            "No. The evaluator samples elements; however, they must test:",
            "• Any deficient knowledge test elements",
            "• At least one knowledge element",
            "• At least one risk management element",
            "• All skill elements (unless otherwise noted)"
          ]
        },
        {
          question: "What does an ACS code such as PA.I.C.K2 represent?",
          answer: [
            "An ACS code shows four things:",
            "",
            "Applicable ACS: Which certificate or rating it applies to (e.g., PA = Private Pilot).",
            "",
            "Area of Operation: The broad category of the task (e.g., I = Area I).",
            "",
            "Task: The specific task within that area (e.g., C = Task C).",
            "",
            "Element: The type of knowledge or skill being evaluated:",
            "• K = Knowledge",
            "• R = Risk Management",
            "• S = Skill",
            "",
            "For example: PA.I.C.K2 means:",
            "• Private Pilot ACS",
            "• Area I",
            "• Task C",
            "• Knowledge element 2",
            "",
            "This element specifically covers \"acceptable weather products and resources required for preflight planning, and current and forecast weather for departure, en route, and arrival phases of flight.\""
          ]
        }
      ]
    },
    {
      title: "4. Required Documents & Eligibility",
      items: [
        {
          question: "What documents must I bring?",
          answer: "",
          customContent: (
            <div className="space-y-4">
              {/* Personal Documents */}
              <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-r">
                <h4 className="font-bold text-emerald-900 mb-3 text-lg">📋 Personal Documents & Records</h4>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Photo ID:</strong> Valid government-issued ID (driver's license or passport)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Student Pilot Certificate</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Medical Certificate:</strong> Current 3rd class or BasicMed documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Knowledge Test Report:</strong> Original AKTR</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Logbook:</strong> Totaled and preferably tabbed, with all required endorsements (IAW AC 61-65J)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>IACRA Application:</strong> FAA Form 8710-1 submitted and endorsed by your instructor</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Application ID:</strong> Your IACRA FTN</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 font-bold">•</span>
                    <span><strong>Payment:</strong> Cash (preferred) or Certified Cashier's Check</span>
                  </li>
                </ul>
              </div>

              {/* Aircraft Documents */}
              <div className="bg-white border-l-4 border-blue-500 p-4 rounded-r">
                <h4 className="font-bold text-blue-900 mb-3 text-lg">✈️ Aircraft Documents (AROW)</h4>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong>A</strong>irworthiness Certificate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong>R</strong>egistration Certificate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong>O</strong>perating Limitations (POH/AFM)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong>W</strong>eight and Balance data</span>
                  </li>
                </ul>
              </div>

              {/* Aircraft Maintenance Records */}
              <div className="bg-white border-l-4 border-orange-500 p-4 rounded-r">
                <h4 className="font-bold text-orange-900 mb-3 text-lg">🔧 Aircraft Maintenance Records</h4>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 font-bold">•</span>
                    <span>Airframe, Engine, and Propeller logbooks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 font-bold">•</span>
                    <div>
                      <span className="font-semibold">Logbooks tabbed for the most recent:</span>
                      <ul className="ml-4 mt-1 space-y-1 text-sm">
                        <li>• Annual Inspection: Within the last 12 calendar months</li>
                        <li>• VOR Check: Within the last 30 days (for IFR)</li>
                        <li>• 100-Hour Inspection: If the aircraft is operated for hire</li>
                        <li>• Transponder: Inspection within the last 24 calendar months</li>
                        <li>• ELT: Inspection and battery replacement status</li>
                        <li>• Pitot-Static System: Inspection within the last 24 calendar months (for IFR)</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 font-bold">•</span>
                    <span>Airworthiness Directives (ADs): Compliance status of all applicable ADs (recurring and one-time)</span>
                  </li>
                </ul>
              </div>

              {/* Equipment */}
              <div className="bg-white border-l-4 border-purple-500 p-4 rounded-r">
                <h4 className="font-bold text-purple-900 mb-3 text-lg">🥽 Equipment</h4>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2 font-bold">•</span>
                    <span>View-limiting device (foggles or hood)</span>
                  </li>
                </ul>
              </div>
            </div>
          )
        },
        {
          question: "What endorsements are required?",
          answer: "Your instructor is responsible for verifying eligibility prior to the test. See the comprehensive endorsements reference below:",
          customContent: <EndorsementsReference />
        }
      ]
    },
    {
      title: "5. English Language Proficiency (AELS)",
      items: [
        {
          question: "Is English language proficiency required for an FAA certificate?",
          answer: "Yes. Applicants for certificates issued under 14 CFR Parts 61, 63, 65, and 107 must be able to read, write, speak, and understand the English language. This is a regulatory eligibility requirement for certification."
        },
        {
          question: "What level of English proficiency does the FAA require?",
          answer: "The FAA has adopted ICAO Operational Level 4 as the minimum acceptable standard. This level ensures an applicant can communicate effectively in normal and non-routine aviation situations."
        },
        {
          question: "What does the FAA evaluate when assessing English language proficiency?",
          answer: [
            "The FAA evaluates the ability to:",
            "",
            "• Read English",
            "• Write English",
            "• Speak clearly and understandably",
            "• Understand spoken English, including ATC instructions",
            "• Communicate effectively in aviation-related situations",
            "",
            "For pilots, this includes the ability to comply with ATC instructions and ensure effective crew communication."
          ]
        },
        {
          question: "Can a Designated Examiner question an applicant's English proficiency during a practical test?",
          answer: "Yes. If an examiner or instructor questions whether an applicant meets the English language eligibility requirement, they may refer the applicant to the local Flight Standards District Office (FSDO) for a formal Aviation English Language Standard (AELS) assessment."
        },
        {
          question: "What happens if an applicant is referred to the FSDO for an English language assessment?",
          answer: "The FSDO will conduct an assessment to determine whether the applicant meets the FAA's English language standard. If the applicant does not contact the FSDO within a reasonable time, a stop may be placed on the application until the issue is resolved."
        },
        {
          question: "What happens if an applicant does not meet the FAA English Language Standard?",
          answer: [
            "• For certificate applicants: The application will be disapproved until the applicant demonstrates compliance.",
            "",
            "• For certificated airmen: The FAA may initiate reexamination under 49 U.S.C. § 44709.",
            "",
            "• In some cases involving medical limitations, operating limitations or exemptions may be issued if permitted by regulation."
          ]
        },
        {
          question: "How is English proficiency assessed?",
          answer: [
            "Assessment may include:",
            "",
            "• Conversational interaction",
            "• Reading aviation materials and explaining them",
            "• Listening to ATC instructions and explaining what was heard",
            "• Demonstrating the ability to communicate clearly in aviation contexts",
            "",
            "For pilots, the evaluation may include observation during flight operations to ensure effective real-world communication."
          ]
        }
      ]
    },
    {
      title: "6. The Oral (Ground) Portion",
      items: [
        {
          question: "How long does the oral portion take?",
          answer: "Typically 1.5–3 hours."
        },
        {
          question: "Is the oral exam based on memorization?",
          answer: "No. The ACS emphasizes application of knowledge, scenario-based discussion, and sound risk management."
        },
        {
          question: "What topics are covered?",
          answer: [
            "Topics align with the ACS Areas of Operation, including:",
            "• Regulations and pilot qualifications",
            "• Airworthiness",
            "• Weather",
            "• Cross-country planning",
            "• Airspace",
            "• Performance and limitations",
            "• Aircraft systems",
            "• Human factors",
            "• Risk management and ADM"
          ]
        }
      ]
    },
    {
      title: "7. The Flight Portion",
      items: [
        {
          question: "How long is the flight test?",
          answer: "Typically 1.5–2.0 hours."
        },
        {
          question: "What tolerances must I meet?",
          answer: "You must perform within ACS standards (e.g., ±100 feet altitude, ±10° heading, ±10 knots airspeed unless otherwise specified)."
        },
        {
          question: "Will emergencies be simulated?",
          answer: "Yes. Emergencies are simulated safely and in accordance with the ACS."
        },
        {
          question: "Does momentary stall horn activation automatically fail slow flight?",
          answer: "No, if promptly recognized and corrected."
        },
        {
          question: "Is altitude loss during stall recovery predetermined?",
          answer: "No. Evaluation considers multiple variables affecting recovery."
        }
      ]
    },
    {
      title: "8. Safety of Flight",
      items: [
        {
          question: "What is the prime consideration during the practical test?",
          answer: "Safety of flight."
        },
        {
          question: "When should simulated emergencies be discontinued?",
          answer: "If safety would be jeopardized."
        },
        {
          question: "What is the FAA-recommended positive exchange of flight controls procedure?",
          answer: [
            "1. \"You have the flight controls.\"",
            "2. \"I have the flight controls.\"",
            "3. \"You have the flight controls.\" (with visual confirmation)"
          ]
        },
        {
          question: "What is being assessed when distractions are introduced?",
          answer: "Situational awareness, workload management, and sound decision-making."
        }
      ]
    },
    {
      title: "9. Risk Management, ADM, CRM & SRM",
      items: [
        {
          question: "Must ADM and risk management be demonstrated in every Task?",
          answer: "Yes."
        },
        {
          question: "What happens if an applicant fails to demonstrate sound ADM?",
          answer: "The Task is unsatisfactory and will be noted on the Notice of Disapproval."
        }
      ]
    },
    {
      title: "10. Aircraft & Equipment Requirements",
      items: [
        {
          question: "What regulation governs aircraft requirements for the practical test?",
          answer: "14 CFR § 61.45."
        },
        {
          question: "Who provides the aircraft?",
          answer: "The applicant must provide an airworthy aircraft that meets regulatory and ACS requirements."
        },
        {
          question: "Can inoperative equipment be present?",
          answer: "Yes, if compliant with § 91.213 and it does not affect required Tasks."
        },
        {
          question: "Must automation management skills be demonstrated?",
          answer: "Yes, if installed and available."
        },
        {
          question: "May I use an EFB?",
          answer: "Yes, if properly trained and able to demonstrate appropriate knowledge and risk management."
        }
      ]
    },
    {
      title: "11. View-Limiting Devices & Simulation",
      items: [
        {
          question: "Who provides the view-limiting device?",
          answer: "The applicant."
        },
        {
          question: "What must the device ensure?",
          answer: "It must block outside visual reference while allowing the evaluator to maintain traffic awareness."
        },
        {
          question: "Can a practical test be conducted in an ATD?",
          answer: "No."
        },
        {
          question: "When may an FSTD be used?",
          answer: "Only within an FAA-approved training program."
        },
        {
          question: "What must be provided when claiming ATD credit?",
          answer: "The manufacturer's Letter of Authorization (LOA)."
        }
      ]
    },
    {
      title: "12. Possible Test Outcomes",
      items: [
        {
          question: "What are the three possible outcomes of a practical test?",
          answer: [
            "• Temporary Airman Certificate (Satisfactory)",
            "• Notice of Disapproval (Unsatisfactory)",
            "• Letter of Discontinuance"
          ]
        },
        {
          question: "What results in a Notice of Disapproval?",
          answer: "Failure of any Task."
        },
        {
          question: "Can a failed Task be retrained during the test?",
          answer: "No."
        }
      ]
    },
    {
      title: "13. Unsatisfactory Performance",
      items: [
        {
          question: "What are examples of unsatisfactory performance?",
          answer: [
            "• Requiring evaluator intervention for safety",
            "• Consistently exceeding ACS tolerances",
            "• Failure to correct deviations",
            "• Failure to exercise sound risk management"
          ]
        },
        {
          question: "If a Task is failed, must the test stop immediately?",
          answer: "The evaluator may stop the test. Continuation requires applicant consent."
        },
        {
          question: "What happens after receiving a Notice of Disapproval?",
          answer: [
            "Following a Notice of Disapproval, the applicant must complete the following requirements:",
            "",
            "Required Actions:",
            "✓ Receive remedial training from an authorized instructor",
            "✓ Obtain an endorsement under 14 CFR § 61.49",
            "✓ Submit a new FAA Form 8710-1 application",
            "✓ Complete a retest with a DPE",
            "",
            "Retest Timeline & Scope:",
            "",
            "Within 60 Days:",
            "• Only previously unsatisfactory and/or unobserved Tasks are required; however, the evaluator may test any Tasks in the ACS, at their discretion.",
            "• More efficient and focused retest process",
            "",
            "After 60 Days:",
            "• The entire practical test must be completed again",
            "• All Areas of Operation will be evaluated"
          ]
        }
      ]
    },
    {
      title: "14. Discontinuances",
      items: [
        {
          question: "When is a Letter of Discontinuance issued?",
          answer: "When the test is stopped for reasons other than unsatisfactory performance (weather, equipment, illness, etc.)."
        },
        {
          question: "Is credit retained after a discontinuance?",
          answer: "Yes, if the practical test is resumed within 60 days in accordance with 14 CFR §§ 61.39 and 61.43. After 60 days, credit expires and the entire test must be repeated."
        },
        {
          question: "Is there an additional fee for a discontinuance?",
          answer: "No, if resumed within 60 days. If more than 60 days elapse and a full retest is required, the full examination fee applies."
        }
      ]
    },
    {
      title: "15. Professionalism & Expectations",
      items: [
        {
          question: "What level of professionalism is expected?",
          answer: "Clear communication, sound judgment, safety-minded decision-making, and adherence to regulations throughout the evaluation."
        },
        {
          question: "Is the evaluator trying to fail me?",
          answer: "No. The evaluator's responsibility is to determine whether you meet FAA standards. The practical test is an opportunity to demonstrate the knowledge and skills developed during your training."
        }
      ]
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Header Section */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Aviation question and answer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <HelpCircle className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-200 mt-2">
            Private Pilot Practical Test - Applicant FAQs
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-400 rounded-lg p-8 mb-12 shadow-lg">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-emerald-700 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-emerald-900 mb-3">About This Guide</h2>
              <p className="text-lg text-emerald-800 leading-relaxed">
                This comprehensive FAQ guide is designed to help Private Pilot applicants understand what to expect during the practical test. 
                Click on any question below to view the answer.
              </p>
              <p className="text-sm text-emerald-700 leading-relaxed mt-3">
                These questions and answers are based on FAA Airman Certification Standards (ACS), applicable regulations under 14 CFR Part 61, and Ryan Gauthier, DPE's practical test policies and procedures.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="bg-emerald-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {section.items.map((item, itemIndex) => {
                  const itemId = `${sectionIndex}-${itemIndex}`;
                  const isOpen = openItems.has(itemId);
                  
                  return (
                    <div key={itemIndex} className="transition-colors hover:bg-gray-50">
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full text-left px-6 py-4 flex items-start justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
                      >
                        <span className="font-semibold text-gray-900 flex-1 pr-4">
                          Q: {item.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-emerald-600 flex-shrink-0 transition-transform duration-200 mt-0.5 ${
                            isOpen ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 pt-2">
                          <div className="pl-4 border-l-4 border-emerald-400 bg-emerald-50/50 p-4 rounded">
                            <p className="font-medium text-gray-700 mb-1">A:</p>
                            {Array.isArray(item.answer) ? (
                              <div className="space-y-1">
                                {item.answer.map((line, lineIndex) => (
                                  <p key={lineIndex} className="text-gray-800 leading-relaxed">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-800 leading-relaxed">{item.answer}</p>
                            )}
                            {item.customContent && (
                              <div className="mt-4">
                                {item.customContent}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Schedule Your Checkride?</h3>
          <p className="text-emerald-100 text-lg mb-6">
            Review the preparation guide and schedule your practical test when you're ready.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Back to Top
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}