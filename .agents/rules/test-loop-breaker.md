# Always On: Anti-Grep/Test Loop Protocol

If a testing script fails, you are **strictly forbidden** from entering a diagnostic loop. Do not read error logs and run `grep` to trace the failure more than once.

You will not delete intermediate diagnostic work. Push to version control and wait for human review.
