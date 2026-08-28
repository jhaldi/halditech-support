---
title: "How To Integrate with TruckSpy"
slug: "how-to-integrate-with-truckspy"
tags: [Integrations, TruckSpy, ELD, Getting Started]
summary: "How to create TruckSpy API tokens and connect them to HaldiTech to pull odometer data."
freshdesk_id: 150000177212
---

# How To Integrate with TruckSpy

1. Log in to TruckSpy as you normally would.

2. Click on the 'Company' tab on the left part of the screen.

   ![TruckSpy Company tab](img-1.png)

3. Look for the 'API Tokens' section on the right side.

   ![API Tokens section](img-2.png)

4. If you've already created tokens, you should see them there — skip to step 6.

5. If you do not have API Tokens in TruckSpy, click the 'Add' link in that API Tokens section. That will open a window to prompt you for a Redirect URI. Enter: [https://fcs.halditech.com](https://fcs.halditech.com). Then click Save and TruckSpy will create a Client ID and Client Secret for you.

   ![Add API Token Redirect URI window](img-3.png)

   ![TruckSpy Client ID and Client Secret](img-4.png)

6. Open HaldiTech in another tab and go to the Integrations tab (under Settings → Account Settings).

7. Edit the Integration Key you have in there, or create a new one if there isn't one there already.

   ![HaldiTech Integration Key](img-5.png)

8. Copy the Client Id from TruckSpy (step 4/5 above) and paste it as the Client Id in HaldiTech.

9. Do the same for the Client Secret. Click "Save".

10. The default is "Reported Odometer", but you can select to use the "Adjusted Odometer" being reported by TruckSpy.

    ![Reported vs Adjusted Odometer option](img-6.png)
