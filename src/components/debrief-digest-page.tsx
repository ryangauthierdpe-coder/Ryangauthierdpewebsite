import { ImageWithFallback } from './figma/ImageWithFallback';
import { FileText, CheckSquare, ClipboardList, Plane, AlertTriangle } from 'lucide-react';

export function DebriefDigestPage() {
  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Header Section */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmlhdGlvbiUyMGRlYnJpZWZ8ZW58MXx8fHwxNzM5NDA3NTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Aviation debrief"
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <FileText className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Debrief Digest</h1>
          <p className="text-xl text-gray-200 mt-2">
            Observations and feedback from recent practical tests
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-8 mb-12 shadow-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3 text-blue-900">Purpose of This Page</h2>
              <p className="text-lg text-blue-800 mb-3">
                Here is a summary of observations and feedback from recent practical tests. This list is updated regularly to highlight trends and recurring areas of focus observed during practical tests.
              </p>
              <p className="text-base text-blue-800 font-semibold">
                These are intended as focused points only; please consult the relevant references to gain a complete understanding of the expectations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Ryan's Debrief Digest</h2>
        </div>

        {/* Section 1: Qualifying the Applicant */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <CheckSquare className="w-8 h-8 text-emerald-600 mr-3" />
            <h3 className="text-2xl font-bold text-emerald-900">1. Qualifying the Applicant</h3>
          </div>

          <div className="space-y-6">
            {/* Endorsements */}
            <div className="bg-white border-l-4 border-emerald-500 rounded-r-lg p-6 shadow">
              <h4 className="text-xl font-bold text-emerald-900 mb-4">Endorsements</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 font-bold text-lg">•</span>
                  <span className="text-gray-800">Following the latest <strong>AC 61-65</strong> for required endorsements.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 font-bold text-lg">•</span>
                  <span className="text-gray-800">Ensuring all endorsements are current and properly worded, <strong>IAW the latest AC 61-65</strong>.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 font-bold text-lg">•</span>
                  <span className="text-gray-800">Solo flights that were conducted without the necessary endorsement(s) will not be credited towards the required aeronautical experience.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 font-bold text-lg">•</span>
                  <span className="text-gray-800"><strong>Pre-solo Aeronautical Knowledge</strong> is make/model specific – reissue if initial solo was in a different aircraft.</span>
                </li>
              </ul>
            </div>

            {/* Night Takeoffs and Landings */}
            <div className="bg-white border-l-4 border-indigo-500 rounded-r-lg p-6 shadow">
              <h4 className="text-xl font-bold text-indigo-900 mb-4">Night Takeoffs and Landings</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-3 font-bold text-lg">•</span>
                  <div className="text-gray-800">
                    <strong>Requirement:</strong> 10 TAKEOFFS and 10 LANDINGS to a full stop at night, with each landing involving a flight in the traffic pattern <span className="text-sm">(61.109(a)(2)(ii))</span>.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-3 font-bold text-lg">•</span>
                  <span className="text-gray-800">Checking logbooks carefully; watch for flights starting during the day and ending at night (could leave TAKEOFF count short).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Ground Portion */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-blue-900">2. Ground Portion</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            <div className="space-y-6">
              {/* Personal Minimums */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Personal Minimums</h4>
                <p className="text-gray-800">Documenting in writing to support go/no-go decisions.</p>
              </div>

              {/* Inoperative Equipment */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Inoperative Equipment</h4>
                <p className="text-gray-800 font-bold">Appropriate procedures for operating with inoperative equipment and the requirements of <strong>§ 91.213</strong>. Pilot-performed preventive maintenance.</p>
              </div>

              {/* Navigation */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Navigation</h4>
                <p className="text-gray-800">If using ForeFlight, be prepared to explain how times, speeds, headings, and other calculations are determined, supported by the appropriate POH charts.</p>
              </div>

              {/* VFR Flight Plans */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-blue-900 mb-2">VFR Flight Plans</h4>
                <p className="text-gray-800">Knowing how to file, open, close, and amend.</p>
              </div>

              {/* Pilot-Controlled Lighting */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Pilot-Controlled Lighting (PCL)</h4>
                <p className="text-gray-800">Checking chart & Chart Supplement; frequencies may vary.</p>
              </div>

              {/* Performance Charts */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Performance Charts</h4>
                <p className="text-gray-800">Understanding how to properly use the charts in the aircraft POH, (TAS, Fuel Burn, Engine Performance, etc.) to include what assumptions are made (flaps, runway, conditions). <strong>Do not extrapolate beyond provided data.</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Flight Portion */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Plane className="w-8 h-8 text-orange-600 mr-3" />
            <h3 className="text-2xl font-bold text-orange-900">3. Flight Portion</h3>
          </div>

          <div className="space-y-6">
            {/* Flight Deck & Pre-Takeoff Briefing */}
            <div className="bg-white border-l-4 border-orange-500 rounded-r-lg p-6 shadow">
              <h4 className="text-xl font-bold text-orange-900 mb-3">Flight Deck & Pre-Takeoff Briefing <span className="text-base font-normal">(ACS-required)</span></h4>
              <p className="text-gray-800 mb-3 font-semibold">The applicant must brief on:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800"><strong>PIC Identification</strong> – Who is in command.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800"><strong>Safety Belts & Harnesses</strong> – Ensure all occupants are restrained.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800"><strong>Doors</strong> – Confirm secured.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800"><strong>Sterile Flight Deck</strong> – Minimize distractions during takeoff, landing, and maneuvers.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800"><strong>Emergency Procedures</strong> – Engine failure, system malfunctions, emergency landing options, checklist use.</span>
                </li>
              </ul>

              <div className="bg-orange-50 border border-orange-200 rounded p-4 mt-4">
                <p className="text-gray-800 mb-2 font-semibold">Good Practice <span className="text-sm font-normal">(ACS-referenced)</span>:</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">Weather and personal minimums</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">Departure/arrival runways, traffic pattern, NOTAMs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">Fuel requirements and performance considerations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Taxiing & Clearing */}
            <div className="bg-white border-l-4 border-purple-500 rounded-r-lg p-6 shadow">
              <h4 className="text-xl font-bold text-purple-900 mb-3">Taxiing & Clearing</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800">Using airport diagram if available</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800">Proper control positioning, brake checks, avoid taxing against brakes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800">Performing clearing turns before maneuvers</span>
                </li>
              </ul>
            </div>

            {/* Landings & Pattern Entry */}
            <div className="bg-white border-l-4 border-teal-500 rounded-r-lg p-6 shadow">
              <h4 className="text-xl font-bold text-teal-900 mb-3">Landings & Pattern Entry</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800">Identifying a specified touchdown point; go around if necessary.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <span className="font-semibold">Pattern entry <span className="text-sm font-normal">(AC 90-66C / AIM)</span>:</span>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">◦</span>
                        <span><strong>Standard:</strong> 45° to downwind</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">◦</span>
                        <span><strong>Alternate:</strong> Midfield crosswind</span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3 font-bold">•</span>
                  <span className="text-gray-800">Maintaining pattern altitude, following proper sequencing, communicating intentions</span>
                </li>
              </ul>
            </div>

            {/* Maneuvers & Flight Skills */}
            <div className="bg-white border-l-4 border-rose-500 rounded-r-lg p-6 shadow">
              <h4 className="text-xl font-bold text-rose-900 mb-3">Maneuvers & Flight Skills</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Ground reference maneuvers:</strong> 600–1,000' AGL
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Pilotage & dead reckoning:</strong> Navigating without GPS/ForeFlight; within 3 NM accuracy
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Navigation systems & lost procedures:</strong> Intercepting and tracking courses, identifying NAVAIDs, tracking to station
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Diversion:</strong> Estimating heading, GS, arrival time, fuel; using available resources
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Power-off stalls:</strong> Stabilized descent, maintaining heading/angle of bank ≤20°
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Recovery from unusual attitudes:</strong> Solely by reference to instruments, requires the use of a view-limiting device
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Emergency descent:</strong> 30–45° bank; following checklist; recognizing depressurization, smoke, engine fire
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-3 font-bold">•</span>
                  <div className="text-gray-800">
                    <strong>Emergency approach & landing:</strong> Choosing safe landing area, considering altitude, wind, terrain, obstacles, glide distance
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 text-center">
          <p className="text-gray-800 font-semibold">
            This page is updated regularly based on observations from recent practical tests.
          </p>
          <p className="text-gray-700 mt-2">
            Always consult the current ACS, FAR/AIM, and relevant Advisory Circulars for complete guidance.
          </p>
        </div>

      </section>
    </div>
  );
}