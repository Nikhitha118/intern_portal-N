const activities = [
  {
    title: "Project Submission",
    time: "Today",
  },
  {
    title: "Client Meeting",
    time: "Tomorrow",
  },
  {
    title: "Weekly Report",
    time: "Friday",
  },
]

export function ActivitiesAndDeadlines() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">

        <h2 className="text-white text-xl font-semibold mb-4">
          Recent Activities
        </h2>

        <div className="space-y-4">

          {activities.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#1f2937] rounded-xl p-4"
            >

              <div>
                <h3 className="text-white">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {item.time}
                </p>
              </div>

              <button className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm">
                View
              </button>

            </div>
          ))}

        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">

        <h2 className="text-white text-xl font-semibold mb-4">
          Deadlines
        </h2>

        <div className="space-y-4">

          <div className="bg-[#1f2937] rounded-xl p-4">
            <h3 className="text-white">
              Internship Final Report
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Due in 3 days
            </p>
          </div>

          <div className="bg-[#1f2937] rounded-xl p-4">
            <h3 className="text-white">
              Presentation Submission
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Due next week
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}