function CommentUserCard({ role, avatar, name }) {
  return (
    <div>
    <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
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