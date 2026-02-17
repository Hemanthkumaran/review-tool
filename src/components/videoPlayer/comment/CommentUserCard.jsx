const getInitials = (firstName = "", lastName = "") =>
  `${firstName.trim()[0] || ""}${lastName.trim()[0] || ""}`.toUpperCase();

function CommentUserCard({ role, avatar, rawData, name }) {
  console.log(getInitials(rawData?.firstName, rawData?.lastName), 'moce');
  return (
    <div>
    <div className="flex items-center gap-3 mb-3">
        {avatar !== null ? <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
          <img src={avatar} className="w-full h-full object-cover" />
        </div> :
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#151618] border border-[#232427] mr-3">
          <div>{getInitials(rawData?.userData.firstName, rawData?.userData.lastName)}</div>
        </button>}
        <div>
          <div className="text-[15px] leading-tight">{name}</div>
          <div className="text-[11px] text-gray-500 leading-tight">
            {role}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentUserCard;