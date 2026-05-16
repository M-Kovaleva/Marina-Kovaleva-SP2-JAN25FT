AI Usage Log
Tool used: ChatGPT

Date: 15 April 2026
Purpose: Explanation of how to configure environment variables in Vite and on Vercel for API credentials
Outcome: Understood import.meta.env.VITE_* convention and how Vercel reads environment variables at build time. Configured .env, .env.example, and Vercel project settings independently.

Date: 19 April 2026
Purpose: Explanation - Error: Unable to apply unknown helper class 'btn' in Tailwind v4
Outcome: Understood that @apply in Tailwind v4 only works with built-in utility classes or custom classes defined inside @layer components. Fixed by wrapping all custom component classes in @layer components {} in input.css. Code written and applied independently after understanding the explanation.

Date: 19 April 2026
Purpose: Explanation of infinity scroll pattern — how to implement scroll-position detection and load-more logic in vanilla JS
Outcome: Understood the pattern: compare window.scrollY + window.innerHeight against document.body.offsetHeight with a threshold offset. Implemented infinity scroll independently in listingsHandler.js.

Date: 19 April 2026
Purpose: Explanation of how to insert emoji characters in VS Code on macOS
Outcome: Used Cmd + Ctrl + Space to open the system emoji panel. Added emoji to UI strings where appropriate.

Date: 22 April 2026
Purpose: Explanation of SPA routing pattern — how to convert URL paths to regex, extract dynamic params, and intercept link clicks with the History API
Outcome: Understood history.pushState, popstate event, and path-to-regex conversion. Implemented router.js with route matching, param extraction, and link interception.

Date: 22 April 2026
Purpose: Explanation of XSS prevention — why and how to escape HTML in dynamically generated content
Outcome: Understood the risk of injecting unescaped user data into innerHTML. Implemented escHtml() utility function independently.

Date: 22 April 2026
Purpose: Explanation — setInterval from countdown timer on listing page continued running after navigating away, causing console errors
Outcome: Understood that intervals must be explicitly cleared with clearInterval when a view is unmounted. Added destroy() lifecycle method to the view class and updated the router to call currentView.destroy() before mounting a new view. Fix applied independently.

Date: 24 April 2026
Purpose: Explanation — Profile page was displaying all listings from the home feed instead of the profile owner's listings
Outcome: Understood the cause: both pages used id="listings-grid", and the home page scroll handler was still running after navigation and found the profile page's grid. Fixed by renaming the profile grid ID to profile-listings-grid and adding destroy() to HomeView to clean up the scroll listener. Applied fix independently.

Date: 25 April 2026
Purpose: Explanation of two-step login pattern — why a second API request is needed after /auth/login when the endpoint does not return all user data (credits)
Outcome: Understood the pattern: authenticate first, then fetch the full profile separately. Extracted syncUserFromProfile() into a dedicated userSync.js module, reused in login, register, and after placing bids. Code written independently.

Date: 25 April 2026
Purpose: Brainstorming - code readability suggestion — double token storage: saveAuth(response.data.accessToken, response.data) stores the token twice (once in TOKEN_KEY and again inside USER_KEY)
Outcome: Understood the issue. Refactored using destructuring: const { accessToken, ...user } = response.data to separate the token from the user object before storing.

Date: 25 April 2026
Purpose: Explanation — stacked logout event listeners: initLogoutHandler was called inside updateNavAuth, adding a new addEventListener on every auth state change
Outcome: Understood why duplicate listeners accumulate and why removeEventListener must precede addEventListener for named handler functions. Fixed using the remove-then-add pattern. Applied independently.

Date: 25 April 2026
Purpose: Explanation of "server as source of truth" — why localStorage should be treated as a cache and always updated from server responses, not through manual arithmetic
Outcome: Understood the concept: server holds the real state, localStorage is a cache. After viewing own profile page, credits from the API response are written back to localStorage and the navbar is updated. updateUser({ credits: profile.credits }) and updateNavAuth() added independently.

Date: 27 April 2026
Purpose: Explnation — stale closure bug in bid form: placing two bids on the same page without refreshing produced an incorrect credit balance (970 -> bid 5 -> bid 6 -> showed 964 instead of correct 959)
Outcome: Understood what a stale closure is: userCredits was captured at form render time and never updated. Fixed by reading getUserCredits() fresh inside the submit handler on every submission, and replacing manual arithmetic with syncUserFromProfile() to get the real server balance. Fix understood and applied independently.

Date: 3 May 2026
Purpose: Explanation — browser Back button from profile page caused an infinite redirect loop: /profile → redirect to /profile/:name → Back → /profile again
Outcome: Understood the difference between history.pushState (adds a history entry) and history.replaceState (replaces the current entry without adding). Changed the /profile redirect to use replaceState so the intermediate URL is not recorded in history. Fix applied independently.

Date: 6 May 2026
Purpose: Explanation — listing title with no spaces overflowed its container and pushed Edit/Delete buttons off screen
Outcome: Understood two CSS concepts: overflow-wrap: break-word (Tailwind: wrap-break-word) forces line breaks inside long words, and min-width: 0 is required on flex children to allow them to shrink below their content width. Both classes added to the title element independently.

Date: 8 May 2026
Purpose: Brainstorming - suggestion for improving avatar placeholder — broken image URL showed an empty circle with no visual indicator
Outcome: Understood the layering technique: place an SVG person icon inside the container and position the <img> on top with absolute inset-0. If the image loads, it covers the icon; if it fails, the icon remains visible. Implemented independently.

Date: 14 May 2026
Purpose: Explanation of Tailwind IntelliSense suggestCanonicalClasses warnings — break-words, flex-shrink-0, aspect-[4/3], grayscale-[30%], min-h-[20px], bg-gradient-to-*
Outcome: Understood that Tailwind v4 renamed several utility classes to more explicit canonical forms. Replaced all flagged classes across the project independently.

Date: 14 May 2026
Purpose: Brainstorming - Suggestions for improving accessibility — review of missing ARIA attributes across all pages and components
Outcome: Understood ARIA roles and attributes: role="dialog", aria-modal, aria-labelledby, role="tablist", role="tab", aria-selected, role="tabpanel", aria-live, aria-describedby, role="status". Added all missing attributes to modals, tab navigation, search results, loading spinners, and form inputs independently.

Date: 14 May 2026
Purpose: Review of all images for missing or empty alt attributes
Outcome: Audited all <img> elements and renderAvatarInto() calls. Added meaningful alt text using profile names and listing titles as fallbacks where alt was an empty string.

Date: 15 May 2026
Purpose: Brainstorming — structured test plan covering all user stories across all pages before final manual testing
Outcome: Developed test plans for Home, Listing, Profile, Create/Edit Listing, and Login/Register pages (GitHub issues). Tests executed and bugs discovered were fixed independently.