import { useState, type SyntheticEvent, } from 'react';
import { generateSchedulePlan } from '../api/planService';
import type { PlanRequestPayload } from '../dtos/PlanRequest.dto';
import { motion } from 'framer-motion'; 

export default function CreatePlan() {
  const [majors, setMajors] = useState('');
  const [minors, setMinors] = useState('');
  const [completedCourses, setCompletedCourses] = useState('');
  const [semestersCompleted, setSemestersCompleted] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formatInput = (input: string) => 
      input.split(',')
           .map(s => s.toLowerCase().replace(/\s+/g, ''))
           .filter(Boolean);

    const payload: PlanRequestPayload = {
      majors: formatInput(majors),
      minors: formatInput(minors),
      completedCourses: formatInput(completedCourses),
      semestersCompleted: Number(semestersCompleted) || 0,
    };

    try {
      console.log('Sending sanitized payload to API:', payload);
      console.log(payload);
      const result = await generateSchedulePlan(payload);
      alert('Success! Plan generation requested. Check console for backend response.');
      console.log('Backend response:', result);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('There was an error generating your plan. Make sure your backend server is running!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // outermost layer has a very dark base color to make the glowing blobs pop
    <div className="min-h-screen bg-[#0a0514] py-20 px-4 font-sans flex justify-center items-center relative overflow-hidden">
      
      {/* --- ANIMATED BACKGROUND LAYERS --- */}
      
      {/* Red blob */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full opacity-40 blur-[120px] pointer-events-none z-0"
        style={{ backgroundColor: '#D00000' }}
        animate={{
          x: ['-20%', '30%', '-20%'],
          y: ['-20%', '20%', '-20%'],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Purple blob */}
      <motion.div
        className="absolute w-[70vw] h-[70vw] rounded-full opacity-50 blur-[140px] pointer-events-none z-0"
        style={{ backgroundColor: '#4B0082' }}
        animate={{
          x: ['30%', '-20%', '30%'],
          y: ['30%', '-10%', '30%'],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 22, // Slightly different duration so they don't loop perfectly together
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* pulsing light red blob */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-30 blur-[100px] pointer-events-none z-0"
        style={{ backgroundColor: '#ff4d4d' }}
        animate={{
          x: ['0%', '10%', '-10%', '0%'],
          y: ['0%', '-10%', '10%', '0%'],
          scale: [0.8, 1.5, 0.8],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* --- FOREGROUND CONTENT --- */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="relative z-10 max-w-2xl w-full bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20"
      >
        
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-academicPurple to-unlScarlet mb-2">
          Your Academic Profile
        </h2>
        <p className="text-gray-600 font-medium mb-8">Enter your details to generate your optimized 4-year plan.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Majors Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Majors (comma separated)</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Engineering, Mathematics"
              value={majors}
              onChange={(e) => setMajors(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-academicPurple/20 focus:border-academicPurple outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Minors Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Minors (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Business, Music"
              value={minors}
              onChange={(e) => setMinors(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-academicPurple/20 focus:border-academicPurple outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Completed Courses Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Completed Courses (comma separated)</label>
            <textarea
              rows={3}
              placeholder="e.g. CSCE 155, MATH 106, ENGL 150"
              value={completedCourses}
              onChange={(e) => setCompletedCourses(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-academicPurple/20 focus:border-academicPurple outline-none transition-all resize-none bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Semesters Completed Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Semesters Completed</label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 3"
              value={semestersCompleted}
              onChange={(e) => setSemestersCompleted(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-academicPurple/20 focus:border-academicPurple outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-unlScarlet to-[#990000] hover:from-[#990000] hover:to-unlScarlet text-unlCream font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-8 cursor-pointer text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Plan'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}