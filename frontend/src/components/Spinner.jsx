
const Spinner = ({ size = 16, color = 'currentColor' }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="4" />
    <path d="M22 12a10 10 0 00-10-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default Spinner;
