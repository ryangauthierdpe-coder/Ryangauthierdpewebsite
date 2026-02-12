import { ImageWithFallback } from './figma/ImageWithFallback';
import { ClipboardCheck, FileCheck, AlertCircle, BookOpen, Clock, CheckCircle, MapPin } from 'lucide-react';
import airportMapImage from 'figma:asset/3d0596824d53551a76219554a0024979bae2da40.png';

interface PreparationPageProps {
  onNavigateToSchedule?: () => void;
}

export function PreparationPage({ onNavigateToSchedule }: PreparationPageProps) {
  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Header Section */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1547717015-67560f10d0a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxvdCUyMGNoZWNrbGlzdCUyMHByZXBhcmF0aW9ufGVufDF8fHx8MTc3MDgyMzk1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Pilot preparation"
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Preparation Guide</h1>
          <p className="text-xl text-gray-200 mt-2">
            Everything you need to know before your checkride
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Process Overview Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-400 rounded-lg p-8 mb-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-emerald-900">Process Overview</h2>
          <p className="text-lg text-emerald-800 mb-6 font-semibold">You're ready to schedule a checkride. Now what?</p>
          
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">1</span>
              <div className="flex items-center flex-wrap pt-1 gap-2">
                <span className="text-lg text-gray-900 font-semibold">Review Ryan's schedule and choose a suitable date.</span>
                <button
                  onClick={onNavigateToSchedule}
                  className="px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  View Schedule
                </button>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">2</span>
              <span className="text-lg text-gray-900 font-semibold pt-1">Select an available date/time and complete the booking form.</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">3</span>
              <div className="flex-1">
                <span className="text-lg text-gray-900 font-semibold pt-1">Watch for a confirmation email; if not received within 24 hours, email Ryan to confirm.</span>
                <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-base text-amber-900 font-semibold">
                      There are several scheduling factors to consider before final confirmation is provided. Please do not make any travel or logistical arrangements until you have received written confirmation via email that your practical test has been officially scheduled.
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">4</span>
              <span className="text-lg text-gray-900 font-semibold pt-1">About two weeks before your exam, Ryan will send a Practical Test Briefing with a scenario to prepare.</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">5</span>
              <span className="text-lg text-gray-900 font-semibold pt-1">Review the information below to ensure you're fully prepared.</span>
            </li>
          </ol>
        </div>
        
        {/* Before Your Appointment */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Clock className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-3xl font-bold">Before Your Appointment</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Timeline Recommendations</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <span><strong>10 days prior:</strong> Confirm you have received the Practical Test Briefing from Ryan (email if not).</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <span><strong>7 days prior:</strong> Submit your IACRA application and ensure your instructor has signed it.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <span><strong>48 hours prior:</strong> Verify all documents, endorsements, and maintenance records are complete and current.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <span><strong>24 hours prior:</strong> Check the weather, review key procedures/regulations, and get adequate rest.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <span><strong>Day of:</strong> Complete preflight preparations, recheck weather, and arrive early.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Day of Checkride */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <ClipboardCheck className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold">Day of Checkride</h2>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
                <p className="text-yellow-800">
                  Plan to arrive at least 15 minutes before your scheduled appointment time. 
                  Late arrivals may result in rescheduling.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">What to Expect</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Plan for roughly 6 hours, from start to finish:</h4>
                <ul className="space-y-3 ml-4">
                  <li className="text-gray-700 ml-4">
                    <strong>30 minutes</strong> for paperwork review prior to beginning the exam
                  </li>
                  <li className="bg-slate-100 p-3 rounded">
                    <p className="text-gray-900 mb-1"><strong>ORAL PORTION (2-3 hours)</strong></p>
                    <p className="text-gray-700">
                      The oral portion covers the Airman Certification Standards (ACS) knowledge areas.
                    </p>
                    <p className="text-gray-700">
                      <strong>ENSURE YOU ARE FAMILIAR WITH THE APPLICABLE ACS!</strong>
                    </p>
                    <p className="text-gray-700">
                      Be prepared to discuss scenarios, regulations, and demonstrate aeronautical decision-making skills.
                    </p>
                  </li>
                  <li className="text-gray-700 ml-4">
                    <strong>30 minutes</strong> for Pre-flight and aircraft preparations
                  </li>
                  <li className="bg-slate-100 p-3 rounded">
                    <p className="text-gray-900 mb-1"><strong>FLIGHT PORTION (1.5-2 hours)</strong></p>
                    <p className="text-gray-700">
                      Demonstrate proficiency in all required maneuvers and procedures per the ACS. 
                      You will act as pilot in command and the examiner will evaluate your performance.
                    </p>
                  </li>
                  <li className="text-gray-700 ml-4">
                    <strong>15 minutes</strong> for the debrief and paperwork
                  </li>
                </ul>
                <p className="text-gray-600 italic mt-3">
                  This is simply an estimate. Depending on how well you are prepared, this may take more or less time than estimated.
                </p>
              </div>
            </div>
            
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-6">
              <h4 className="font-semibold text-orange-900 mb-2">Aircraft Preparation</h4>
              <p className="text-orange-800">
                Ensure the airplane is fueled, cleaned, and that all equipment (lights, radios, instruments, etc.) 
                works properly before the examiner arrives. A properly prepared aircraft demonstrates professionalism 
                and airmanship.
              </p>
              <p className="text-orange-800 mt-3">
                <strong>Reminder: Any Inoperative instruments or equipment must be IAW §91.213.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <FileCheck className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-3xl font-bold">Required Documents</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Documents */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-emerald-900">Personal Documents & Records</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Photo ID:</strong> Valid government-issued ID (driver's license or passport)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Pilot Certificate/License:</strong> Student pilot certificate</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Medical Certificate:</strong> Current 3rd class medical or BasicMed documents</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Knowledge Test Results:</strong> Original passing written exam results</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Logbook:</strong> Totaled and preferably tabbed, showing ALL required aeronautical experience, with ALL necessary endorsements signed by a CFI (IAW AC 61-65J)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>IACRA/FAA Form 8710:</strong> Submitted in IACRA and endorsed by your Recommending Instructor</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Application ID:</strong> Your IACRA Application ID</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <div>
                    <span><strong>DPE Fee:</strong> Cash (preferred) or Certified Cashier's Check. <em>Credit cards or Personal Checks are NOT accepted.</em></span>
                    <br />
                    <span className="text-sm mt-1 inline-block">See applicable fee on the Home Page</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Aircraft Documents */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-emerald-900">Aircraft Documents (AROW)</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>A</strong>irworthiness Certificate</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>R</strong>egistration Certificate</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>O</strong>perating Limitations (POH/AFM)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>W</strong>eight and Balance data</span>
                </li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4 mt-6 text-emerald-900">Aircraft Maintenance Logs</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Airframe, Engine, and Propeller logbooks</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <div>
                    <span className="font-semibold">Logbooks tabbed for the most recent:</span>
                    <ul className="ml-4 mt-2 space-y-1.5 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Annual Inspection: Within the last 12 calendar months</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>VOR Check: Within the last 30 days (for IFR)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>100-Hour Inspection: If the aircraft is operated for hire</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Transponder: Inspection within the last 24 calendar months</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>ELT: Inspection and battery replacement status</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Pitot-Static System: Inspection within the last 24 calendar months (for IFR)</span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Airworthiness Directives (ADs): Compliance status of all applicable ADs (recurring and one-time)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Flight Planning & Equipment */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-3xl font-bold">Flight Planning & Equipment</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-900">Navigation Tools</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Navigation plotter (manual or electronic)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>E6B flight computer (manual or electronic)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Current Sectional and Terminal Area Charts (paper or electronic)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Current FAR/AIM or electronic equivalent</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-900">Flight Preparation</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <div>
                      <span>Completed navigation log for your planned cross-country</span>
                      <ul className="ml-6 mt-1">
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          <span className="text-sm">Routing to be provided with the Practical Test Briefing<br />(~2 weeks prior)</span>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Current weather briefing and analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <div>
                      <span>Weight and balance calculations for the flight</span>
                      <ul className="ml-6 mt-1">
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          <span className="text-sm">Examiner's weight: 225#</span>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Performance calculations for takeoff and landing</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-900">Flight Gear</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Headset</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Kneeboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Foggles or view-limiting device</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-900">Personal Items</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Water and snacks (it's a long day!)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>Pens and paper</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>iPad/tablet with charging cables (if using electronic charts)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Location */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <MapPin className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-3xl font-bold">Where to Meet on Test Day</h2>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-900 font-semibold">
              Unless prior arrangements are made, all exams are conducted at WST.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-emerald-900">Location</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Ground Portion:</h4>
              <p className="text-gray-700">
                <strong>Westerly State Airport (WST)</strong><br />
                Main Terminal Building<br />
                56 Airport Road<br />
                Westerly, RI 02891
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Arrival Instructions:</h4>
              <p className="text-gray-700 mb-4">
                Upon arrival at WST on the day of your practical test, please proceed to the Main Terminal building, where we will meet.
              </p>
              <p className="text-gray-700 mb-4">
                Parking is available on the ramp directly in front of the terminal. Look for spaces marked with a "T" in the center of the ramp and park facing the terminal.
              </p>
              <p className="text-gray-700 mb-4">
                Enter the building through the door on the left, which is marked "General Aviation." We will meet in the conference room located inside that entrance.
              </p>
              <p className="text-gray-700 mb-4">
                If you have any difficulty finding the location, feel free to reach out. I look forward to meeting you.
              </p>
              
              {/* Airport Map */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={airportMapImage} 
                  alt="Westerly State Airport parking and terminal location map" 
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Yellow box: Transient parking area (marked with T) | Green line: Path to terminal entrance
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Questions?</h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about preparation or required documents, 
            please don't hesitate to contact Ryan before your scheduled appointment.
          </p>
        </div>

      </section>
    </div>
  );
}