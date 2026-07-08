export default function LoadingPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700 dark:from-teal-900 dark:to-cyan-950">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-100 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-7-7 7M12 3v12" />
          </svg>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-teal-200 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-teal-200 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-teal-200 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm font-semibold text-teal-100/80">Getting things ready</p>
      </div>
    </div>
  )
}
