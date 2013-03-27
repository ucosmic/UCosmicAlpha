namespace UCosmic.Web.Mvc.Models
{
    public class TextValuePair
    {
        public TextValuePair() : this(null, null)
        {
        }

        public TextValuePair(string value)
            :this(value, value)
        {
        }

        public TextValuePair(string text, string value)
        {
            Text = text;
            Value = value;
        }

        public string Text { get; set; }
        public string Value { get; set; }
    }
}