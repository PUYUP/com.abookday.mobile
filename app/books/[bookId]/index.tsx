import { BookDetails } from '@/state/library/book-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { addDays, format } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const BOOK: BookDetails = {
    id: '4',
    title: 'Project Hail Mary with Sebastian Junger the Villages',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    coverImageUri: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7',
    description: 'A lone astronaut must save Earth from a dying sun.',
    totalPages: 1476,
    lastReadPage: 158,
    status: 'reading',
};

const RAW_DATA = [
    { value: 160, date: '2022-04-01' },
    { value: 180, date: '2022-04-02' },
    { value: 190, date: '2022-04-03' },
    { value: 180, date: '2022-04-04' },
    { value: 140, date: '2022-04-05' },
    { value: 145, date: '2022-04-06' },
    { value: 160, date: '2022-04-07' },
    { value: 200, date: '2022-04-08' },
    { value: 220, date: '2022-04-09' },
    { value: 240, date: '2022-04-10' },
    { value: 280, date: '2022-04-11' },
    { value: 260, date: '2022-04-12' },
    { value: 340, date: '2022-04-13' },
    { value: 385, date: '2022-04-14' },
    { value: 280, date: '2022-04-15' },
    { value: 390, date: '2022-04-16' },
    { value: 370, date: '2022-04-17' },
    { value: 285, date: '2022-04-18' },
    { value: 295, date: '2022-04-19' },
    { value: 300, date: '2022-04-20' },
    { value: 280, date: '2022-04-21' },
    { value: 295, date: '2022-04-22' },
    { value: 260, date: '2022-04-23' },
    { value: 255, date: '2022-04-24' },
    { value: 190, date: '2022-04-25' },
    { value: 0,   date: '2022-04-26' },
    { value: 0,   date: '2022-04-27' },
    { value: 10,  date: '2022-04-28' },
    { value: 210, date: '2022-04-29' },
    { value: 200, date: '2022-04-30' },
    { value: 240, date: '2022-05-01' },
    { value: 250, date: '2022-05-02' },
    { value: 280, date: '2022-05-03' },
    { value: 250, date: '2022-05-04' },
    { value: 210, date: '2022-05-05' },
    { value: 0,   date: '2022-05-06' },
    { value: 0,   date: '2022-05-07' },
    { value: 0,   date: '2022-05-08' },
    { value: 0,   date: '2022-05-09' },
    { value: 30,  date: '2022-05-10' },
];

// padding kiri/kanan container (paddingHorizontal: 10) × 2
const CONTAINER_HORIZONTAL_PADDING = 20;
const Y_AXIS_LABEL_WIDTH = 50;
const CHART_SPACING = 14;
const CHART_SECTIONS = 6;
const CHART_STEP_HEIGHT = 25;
const CHART_HEIGHT = CHART_SECTIONS * CHART_STEP_HEIGHT; // 150

/* --------- Chart --------- */
const ChartComponent = () => {
    const theme = useTheme();
    const chartWidth = Dimensions.get('window').width - CONTAINER_HORIZONTAL_PADDING - Y_AXIS_LABEL_WIDTH;

    const formattedData = RAW_DATA.map((item, index) => {
        const isWeekStart = index % 7 === 0;
        if (!isWeekStart) return item;

        const startDate = new Date(item.date);
        const endDate = addDays(startDate, 6); // hari terakhir minggu = +6, bukan +7
        const label = `${format(startDate, 'd')}-${format(endDate, 'd')} ${format(startDate, 'MMM yy')}`;

        return {
            ...item,
            label,
            labelTextStyle: { width: 110, fontSize: 11, color: '#666' },
            showVerticalLine: true,
            verticalLineColor: '#e5e5e5',
            verticalLineThickness: 1,
            verticalLineDashPattern: [0, 4],
        };
    });

    return (
        <LineChart
            areaChart
            hideRules
            data={formattedData}
            overScrollMode="auto"
            disableScroll={false}
            hideDataPoints
            spacing={CHART_SPACING}
            color={theme.colors.primary}
            thickness={2}
            startFillColor={theme.colors.primary}
            endFillColor={theme.colors.primary}
            startOpacity={0.25}
            endOpacity={0.05}
            initialSpacing={0}
            noOfSections={CHART_SECTIONS}
            stepHeight={CHART_STEP_HEIGHT}
            height={CHART_HEIGHT}
            width={chartWidth}
            yAxisColor="transparent"
            yAxisThickness={0}
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            yAxisTextStyle={{ color: '#666', fontSize: 11 }}
            yAxisTextNumberOfLines={1}
            xAxisColor="lightgray"
            pointerConfig={{
                pointerStripHeight: CHART_HEIGHT,
                pointerStripColor: theme.colors.primary,
                pointerStripWidth: 1,
                pointerColor: theme.colors.primary,
                radius: 5,
                pointerLabelWidth: 90,
                pointerLabelHeight: 40,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: (items: any) => (
                    <View style={styles.tooltipContainer}>
                        <Text style={styles.tooltipDate}>
                            {format(new Date(items[0].date), 'MMM d')}
                        </Text>
                        <Text style={styles.tooltipValue}>
                            {items[0].value} min.
                        </Text>
                    </View>
                ),
            }}
        />
    );
};

/* --------- Main Book Detail Screen --------- */
export default function BookDetailScreen() {
    const router = useRouter();
    const theme = useTheme();
    const progressPct = Math.round(
        ((BOOK.lastReadPage ?? 0) / (BOOK.totalPages ?? 1)) * 100
    );

    return (
        <React.Fragment>
            <Stack.Screen
                options={{
                    headerTitle: 'Book Details',
                    headerBackButtonDisplayMode: 'minimal',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.headerButton}
                        >
                            <MaterialIcons name="arrow-back-ios" size={22} color={theme.colors.primary} />
                            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>Back</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => {}}
                            style={styles.headerButton}
                        >
                            <MaterialIcons name="edit" size={22} color={theme.colors.primary} />
                            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>Edit</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.container} edges={[]}>
                <ScrollView nestedScrollEnabled>
                    {/* Book info */}
                    <View style={styles.detailRow}>
                        <View style={styles.cover}>
                            {BOOK.coverImageUri ? (
                                <Image source={{ uri: BOOK.coverImageUri }} style={styles.coverImage} />
                            ) : (
                                <View style={styles.coverFallback} />
                            )}
                        </View>

                        <View style={styles.content}>
                            <View>
                                <Text style={styles.title}>{BOOK.title}</Text>
                                <View style={styles.authorRow}>
                                    {BOOK.author && <Text style={styles.author}>{BOOK.author}</Text>}
                                    {BOOK.genre && (
                                        <>
                                            <MaterialIcons name="circle" size={4} color="#999" style={styles.dot} />
                                            <Text style={styles.genre}>{BOOK.genre}</Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            <View style={styles.meta}>
                                <Text style={styles.pages}>{BOOK.totalPages} pages</Text>
                                {BOOK.status === 'reading' && (
                                    <View style={styles.readingBadge}>
                                        <MaterialIcons name="book" size={16} color="#228b22" />
                                        <Text style={styles.readingNow}>Reading</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Reading stats */}
                    <View style={styles.readingStatsRow}>
                        <View style={styles.readingStatsHeader}>
                            <Text style={styles.readingStatsHeaderText}>Reading Activity</Text>
                        </View>

                        <View style={styles.statsRow}>
                            <View>
                                <Text style={styles.statsLabel}>Time</Text>
                                <Text style={styles.statsValue}>2,234 min</Text>
                            </View>
                            <View>
                                <Text style={styles.statsLabel}>Daily Avg</Text>
                                <Text style={styles.statsValue}>3 pages</Text>
                            </View>
                            <View>
                                <Text style={styles.statsLabel}>Read Pages</Text>
                                <Text style={styles.statsValue}>{BOOK.lastReadPage ?? 0}</Text>
                            </View>
                            <View>
                                <Text style={styles.statsLabel}>Progress</Text>
                                <Text style={styles.statsValue}>{progressPct}%</Text>
                            </View>
                        </View>
                    </View>

                    <ChartComponent />
                </ScrollView>
            </SafeAreaView>
        </React.Fragment>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    /* Header */
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    headerButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },

    /* Book info */
    detailRow: {
        flexDirection: 'row',
        gap: 16,
        padding: 16,
    },
    cover: {
        width: 80,
        height: 96,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    coverFallback: {
        flex: 1,
        backgroundColor: '#ccc',
    },
    content: {
        flex: 1,
        paddingVertical: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    authorRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    author: {
        fontSize: 14,
        color: '#666',
    },
    dot: {
        alignSelf: 'center',
    },
    genre: {
        fontSize: 14,
        color: '#999',
    },
    meta: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 'auto',
    },
    pages: {
        fontSize: 14,
        color: '#666',
    },
    readingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingLeft: 6,
    },
    readingNow: {
        color: '#228b22',
        fontWeight: '600',
    },

    /* Stats */
    readingStatsRow: {
        borderTopWidth: 1,
        borderColor: '#e5e5e5',
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginBottom: 0,
    },
    readingStatsHeader: {
        paddingHorizontal: 6,
        marginBottom: 10,
    },
    readingStatsHeaderText: {
        fontSize: 16,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
        paddingHorizontal: 6,
    },
    statsLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    statsValue: {
        fontSize: 15,
        fontWeight: '600',
    },

    /* Tooltip */
    tooltipContainer: {
        height: 40,
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tooltipDate: {
        fontSize: 11,
        color: '#666',
    },
    tooltipValue: {
        fontSize: 12,
        fontWeight: '600',
    },
});