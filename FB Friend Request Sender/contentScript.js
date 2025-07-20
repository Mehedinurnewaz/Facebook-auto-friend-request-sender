async function sendFriendRequest() {
  return new Promise(async (resolve, reject) => {
    try {
      // অপেক্ষা করো button লোড হওয়ার জন্য
      await new Promise(r => setTimeout(r, 5000));

      // সব সম্ভাব্য Add Friend button খোঁজো
      const buttons = Array.from(document.querySelectorAll('button, a')).filter(el =>
        el.innerText && el.innerText.match(/Add Friend|Friend Request/i)
      );

      if (buttons.length === 0) {
        resolve({ success: false, reason: 'No add friend button found' });
        return;
      }

      let clicked = false;
      for (const btn of buttons) {
        if (btn.innerText.match(/Add Friend|Friend Request/i)) {
          btn.click();
          clicked = true;
          break;
        }
      }

      if (clicked) {
        resolve({ success: true });
      } else {
        resolve({ success: false, reason: 'No clickable add friend button' });
      }

    } catch (error) {
      resolve({ success: false, reason: error.message });
    }
  });
}
