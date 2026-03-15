from models.preference import Preference
from models.course import Course
from models.allocation import Allocation

class AllocationEngine:
    def __init__(self, semester):
        self.semester = semester

    def run(self):
        all_prefs = Preference.all_prefs(self.semester)
        courses = {c['id']: c for c in Course.all()}
        Allocation.clear(self.semester)

        # Group by student
        by_student = {}
        for p in all_prefs:
            by_student.setdefault(p['student_id'], []).append(p)
        for sid in by_student:
            by_student[sid].sort(key=lambda x: x['rank_order'])

        seat_count = {}  # course_id -> allocated count
        student_slots = {}  # student_id -> [time_slots]

        # Score all candidates
        candidates = []
        for sid, prefs in by_student.items():
            max_rank = len(prefs)
            completed = Allocation.completed(sid)
            for p in prefs:
                cid = p['course_id']
                c = courses.get(cid)
                if not c: continue

                # Eligibility: check prerequisite
                eligible = True
                if c['prerequisite_id'] and c['prerequisite_id'] not in completed:
                    eligible = False

                # Preference score (rank 1 = 1.0, rank N = ~0)
                pref_score = 1.0 - ((p['rank_order'] - 1) / max(max_rank, 1))

                # Availability score
                allocated = seat_count.get(cid, 0)
                avail = max(0, (c['capacity'] - allocated) / max(c['capacity'], 1))

                # Eligibility score
                elig_score = 1.0 if eligible else 0.0

                # Weighted total
                total = 0.60 * pref_score + 0.25 * elig_score + 0.15 * avail

                candidates.append({
                    'student_id': sid,
                    'course_id': cid,
                    'score': total,
                    'eligible': eligible,
                    'time_slot': c.get('time_slot', ''),
                })

        candidates.sort(key=lambda x: x['score'], reverse=True)

        total_allocated = 0
        for c in candidates:
            sid = c['student_id']
            cid = c['course_id']
            course = courses.get(cid)

            if not c['eligible']:
                Allocation.save(sid, cid, self.semester, c['score'], 'rejected')
                continue

            # Time conflict check
            slots = student_slots.get(sid, [])
            if c['time_slot'] and c['time_slot'] in slots:
                Allocation.save(sid, cid, self.semester, c['score'], 'rejected')
                continue

            current = seat_count.get(cid, 0)
            if current < course['capacity']:
                Allocation.save(sid, cid, self.semester, c['score'], 'allocated')
                seat_count[cid] = current + 1
                student_slots.setdefault(sid, []).append(c['time_slot'])
                total_allocated += 1
            else:
                Allocation.save(sid, cid, self.semester, c['score'], 'waitlist')

        return {
            'students_processed': len(by_student),
            'allocations_made': total_allocated,
        }
