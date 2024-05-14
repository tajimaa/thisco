package util;

public class Sanitizer {
	public static String sanitizing(String str) {

        if (null == str || "".equals(str)) {
            return str;
        }
        StringBuilder result = new StringBuilder();
        for (char c : str.toCharArray()) {
            switch (c) {
                case '<':
                    result.append("&lt;");
                    break;
                case '>':
                    result.append("&gt;");
                    break;
                case '&':
                    result.append("&amp;");
                    break;
                case '"':
                    result.append("&quot;");
                    break;
                case '\'':
                    result.append("&#39;");
                    break;
                case '\\':
                    result.append("&#92;");
                    break;
                default:
                    result.append(c);
            }
        }
        return result.toString();

    }
}
