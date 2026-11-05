const cards = [
  {
    title: "Completed Tasks",
    value: "24",
  },
  {
    title: "Pending Tasks",
    value: "8",
  },
  {
    title: "Attendance",
    value: "92%",
  },
  {
    title: "Performance",
    value: "Excellent",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-[#111827] border border-gray-800 rounded-2xl p-5"
        >

          <p className="text-gray-400 text-sm">
            {card.title}
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {card.value}
          </h2>

        </div>
      ))}

    </div>
  )
}