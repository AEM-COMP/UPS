export default function decorate(block) {
  const [ques, ans] = block.children;
ques.className = "ques";
ans.className = "ans";
}
