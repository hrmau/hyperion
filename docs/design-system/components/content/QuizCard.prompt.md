`QuizCard` is the one green card on the homepage.

```jsx
<QuizCard
  question="Does Ireland or Spain get more of its power from wind?"
  options={["Ireland", "Spain"]}
  footnote="58% of Irish visitors get this wrong."
/>
```

Always two options, one of them the visitor's own country. The wrong-answer percentage is mandatory — it is what converts.
