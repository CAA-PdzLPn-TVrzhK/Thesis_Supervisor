1. **Is the product complete? Which parts are done and which aren’t done?**

   - **Done:**  
     **Student Features**  
     - Student profile which shows the progress of the topic selected by the student.  
     - Document management for the file uploaded by the student.  
     - Track the progress of the thesis to see how much is completed and what is remaining.
     - Peer groups to encourage thesis completion.
     - Provide feedback history for future reference.  

     **Supervisor Features**  
     - Analytics Dashboard that provides students with performance, common issues and overall progress trends.  
     - View students' submissions.  
     - Provide feedback to students on submitted work.
     - View full student profiles (thesis topics, progress reports, feedback history).
     - Bulk notification to multiple students regarding thesis.
     - Provide structured notes for meetings with students.

   - **Not done:**  
     **Student Features**  
     - Resource link to eduwiki on how to write the thesis.
     - Integration with DoE calendar/appointments.  
     - Feedback mechanism to improve the bot.  

     **Supervisor Features**      
     - Integration with anti‑plagiarism/AI for plagiarism & citation checks.  
     - Generate reports on student progress.  

2. **Is the customer using the product? How often? In what way? If not, why not?**  
   - Used only in demo meetings; no ongoing production usage  
   - Not in regular use because he have already working project done by himself

3. **Has the customer deployed the product on their side?**  
   - No, but we already deployed it:  
     - Frontend hosted on Netlify (HTTPS enabled)  
     - Backend (database + storage) on Supabase

4. **What measures need to be taken to fully transition the product?**  
   - Fix outstanding bugs (chart links, profile menu, auto‑refresh logic)  
   - Configure Supabase real‑time listeners for auto‑refresh  
   - Finalize and expand README (setup, deployment, troubleshooting)  
   - Embed a 1–2 min demo video link and key screenshots in README  
   - Grant Netlify (Admin) and Supabase (Editor) access to the customer

5. **What are the customer’s plans for the product after its delivery? Are they going to continue working on it? Would they like to continue collaborating with the team and on what conditions?**  
   - They plan to review the codebase for reusable components (“steal” features)  
   - May continue independent development or contribute back under new terms (scope & budget TBD)

6. **How to increase the chance that it’ll be useful after the final delivery?**  
   - Implement automated tests (unit & end‑to‑end) for critical flows  
   - Provide comprehensive documentation with screenshots and a demo video  
   - Improve UX: chart‑to‑detail navigation, real‑time UI updates  
   - Offer a short support/testing period post‑handover

7. **Customer feedback on your README (go through it together at the meeting):**  
   - **Is everything clear?**  
     - Overall instructions are understandable  
   - **What can be improved?**  
     - Embed inline screenshots of key UIs  
     - Add a link to a short demo video

8. **Are they able to launch/deploy using your instructions?**  
   - Yes — no deployment blockers were reported during the meeting

9. **What two other sections the customer would like to be included in the ReadMe?**  
   - **Screenshots** of main views (dashboard, profile settings, calendar)  
   - **Video Demo** link (short walkthrough)

10. **The full transcript and recording of the meeting:**
   - https://drive.google.com/drive/folders/1-0tyD0ml0euLEZfQNDJeuZOKW05XrESg?hl=ru
