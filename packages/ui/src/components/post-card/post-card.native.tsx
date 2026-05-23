import { View, Text, TouchableOpacity } from "react-native";

export function PostCard() {
  return (
    <View
      className="bg-amber-500"
      style={{
        padding: 16,
        // backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        Post Title
      </Text>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
        This is a summary of the post content. It gives a brief overview of what
        the post is about.
      </Text>
      <TouchableOpacity
        onPress={() => {
          /* Navigate to post details */
        }}
      >
        <Text style={{ color: "#1e90ff" }}>Read more</Text>
      </TouchableOpacity>
    </View>
  );
}
